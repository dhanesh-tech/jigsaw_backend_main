import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarScheduledInterview } from './entities/calendar-scheduled-interview.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import {
  classSerialiser,
  convertDateTimeZone,
  hmsRoomDescription,
  hmsRoomName,
} from 'src/_jigsaw/helpersFunc';
import { User } from 'src/users/entities/user.entity';
import { CalendarScheduleEventDto } from './dto/calendar-schedule-interview.dto';
import { CalendarAvailability } from 'src/calendar-availability/entities/calendar-availabilty.entity';
import {
  CALENDAR_AVAILABILITY_NOT_FOUND,
  CALENDAR_EVENT_NOT_FOUND,
  EVENT_INVITATION_NOT_FOUND,
  NOT_AUTHORIZED_TO_JOIN_SCHEDULED_EVENT,
  NOT_AUTHORIZED_TO_SCHEDULE_EVENT,
  SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED,
} from 'src/_jigsaw/constants';
import { HmsService } from 'src/hms/hms.service';
import { CalendarInterviewInvitationDto } from './dto/calandar-interview-invitation.dto';
import { CalendarInterviewInvitation } from './entities/calandar-interview-invitation.entity';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';
import { REFERRAL_INVITE_STATUS } from 'src/referral/utilities/enum';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import {
  CALENDAR_EVENT_SCHEDULED,
  CALENDAR_EVENT_SCHEDULED_EMAIL_SEND,
} from 'src/_jigsaw/eventSignalConstants';

@Injectable()
export class CalendarScheduledInterviewService {
  constructor(
    @InjectRepository(CalendarScheduledInterview)
    private scheduleEventRepository: Repository<CalendarScheduledInterview>,

    @InjectRepository(CalendarAvailability)
    private availabilityRepository: Repository<CalendarAvailability>,

    @InjectRepository(CalendarEvent)
    private eventRepository: Repository<CalendarEvent>,

    @InjectRepository(CalendarInterviewInvitation)
    private eventInvitationRepository: Repository<CalendarInterviewInvitation>,

    private readonly hmsService: HmsService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  /**
   * Schedules an event based on the provided availability ID, event details, and user information.
   *
   * @param availability_id - The ID of the availability slot.
   * @param scheduleEventDto - Data Transfer Object containing event details.
   * @param user - The user scheduling the event.
   * @returns The scheduled event.
   */
  async scheduleEvent(
    availability_id: number,
    scheduleEventDto: CalendarScheduleEventDto,
    user: User,
  ): Promise<any> {
    // Determine timezone, defaulting to the user's timezone if not provided in the DTO
    const userTimezone = scheduleEventDto.timezone
      ? scheduleEventDto.timezone
      : user.timezone;

    // Fetch the availability slot from the repository
    const availability = await this.availabilityRepository.findOne({
      where: { id: availability_id },
      relations: ['user_id'],
    });

    if (!availability) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (availability.user_id.id === user.id) {
      throw new HttpException(
        NOT_AUTHORIZED_TO_SCHEDULE_EVENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Convert the start time and end time to UTC
    const start_time_in_utc = convertDateTimeZone(
      scheduleEventDto.interview_date,
      scheduleEventDto.start_time,
      userTimezone,
      'UTC',
    );
    const end_time_in_utc = convertDateTimeZone(
      scheduleEventDto.interview_date,
      scheduleEventDto.end_time,
      userTimezone,
      'UTC',
    );

    // Generate a unique room name based on the organiser and joinee IDs
    const roomName = hmsRoomName(availability.user_id.id, user.id);

    // Generate a room description based on the organiser and joinee IDs
    const roomDescription = hmsRoomDescription(
      availability.user_id.id,
      user.id,
    );

    // Create a new room using the HMS service and get the room ID
    const hmsRoomId = await this.hmsService.createRoom({
      name: roomName,
      description: roomDescription,
    });

    // Prepare the data for the new scheduled event
    const formattedData = {
      interview_date_in_utc: start_time_in_utc,
      end_time_in_utc,
      start_time_in_utc,
      organiser_id: availability.user_id,
      joinee_id: user,
      event_id: scheduleEventDto?.event_id
        ? { id: scheduleEventDto.event_id }
        : null,
      job_application_id: scheduleEventDto?.job_application_id
        ? { id: scheduleEventDto.job_application_id }
        : null,
      hms_room_id: hmsRoomId,
    };

    // Create a new scheduled event entity
    const scheduleEvent =
      await this.scheduleEventRepository.create(formattedData);

    // Save the scheduled event to the repository and return it
    const scheduledData =
      await this.scheduleEventRepository.save(scheduleEvent);

    // emit event to send email
    this.eventEmitter.emit(CALENDAR_EVENT_SCHEDULED_EMAIL_SEND, scheduledData);

    // // emit event to update google calendar
    this.eventEmitter.emit(CALENDAR_EVENT_SCHEDULED, scheduledData);

    return classSerialiser(CalendarScheduledInterview, scheduledData);
  }

  /**
   * Retrieves the details of a scheduled event by its ID and user ID.
   *
   * @param id - The ID of the scheduled event.
   * @param user_id - The ID of the user requesting the event details.
   * @returns The details of the scheduled event.
   */
  async getScheduledEventDetail(
    id: number,
    user_id: number,
  ): Promise<CalendarScheduledInterview> {
    // Fetch the scheduled event from the repository
    const event = await this.scheduleEventRepository.findOne({
      where: [
        {
          id,
          joinee_id: { id: user_id },
        },
        {
          id,
          organiser_id: { id: user_id },
        },
      ],
      relations: [
        'organiser_id',
        'joinee_id',
        'job_application_id',
        'interview_ratings',
        'ai_interview_analysis',
      ],
    });

    if (!event) {
      throw new HttpException(
        SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED,
        HttpStatus.NOT_FOUND,
      );
    }

    return classSerialiser(CalendarScheduledInterview, event);
  }

  /**
   * Retrieves upcoming scheduled events for a given user.
   *
   * @param user_id - The user for whom to retrieve upcoming events.
   * @returns A list of upcoming scheduled events.
   */
  async getUpcomingScheduledEvents(
    user_id: number,
  ): Promise<CalendarScheduledInterview[]> {
    const currentDateTime = new Date().toISOString();

    // Fetch upcoming events from the repository
    const upcomingEvents = await this.scheduleEventRepository.find({
      where: [
        {
          joinee_id: { id: user_id },
          start_time_in_utc: MoreThan(currentDateTime),
        },
        {
          organiser_id: { id: user_id },
          start_time_in_utc: MoreThan(currentDateTime),
        },
      ],
      relations: ['organiser_id', 'joinee_id'],
      order: {
        start_time_in_utc: 'ASC',
      },
    });

    return upcomingEvents.map((event) =>
      classSerialiser(CalendarScheduledInterview, event),
    );
  }

  /**
   * Retrieves past scheduled events for a given user.
   *
   * @param user_id - The user for whom to retrieve past events.
   * @returns A list of past scheduled events.
   */
  async getPastScheduledEvents(
    user_id: number,
  ): Promise<CalendarScheduledInterview[]> {
    const currentDateTime = new Date().toISOString();

    // Fetch past events from the repository
    const pastEvents = await this.scheduleEventRepository.find({
      where: [
        {
          joinee_id: { id: user_id },
          end_time_in_utc: LessThan(currentDateTime),
        },
        {
          organiser_id: { id: user_id },
          end_time_in_utc: MoreThan(currentDateTime),
        },
      ],
      relations: ['organiser_id', 'joinee_id'],
      order: {
        start_time_in_utc: 'DESC',
      },
    });

    return pastEvents.map((event) =>
      classSerialiser(CalendarScheduledInterview, event),
    );
  }

  /**
   * Invites a user to an existing scheduled event.
   *
   * @param event_id - The ID of the scheduled event.
   * @param user_id - The ID of the user to be invited.
   * @returns The updated scheduled event with the invited user.
   */
  async inviteUserToEvent(
    inviteDto: CalendarInterviewInvitationDto,
    user_id: number,
  ): Promise<CalendarInterviewInvitation> {
    const { event_id } = inviteDto;
    // Fetch the scheduled event from the repository
    const event = await this.eventRepository.findOne({
      where: { id: +event_id, organiser_id: { id: user_id } },
    });

    if (!event) {
      throw new HttpException(CALENDAR_EVENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const eventInvitation = await this.eventInvitationRepository.create({
      ...inviteDto,
      invited_by_id: { id: user_id },
    });

    const savedEvent =
      await this.eventInvitationRepository.save(eventInvitation);

    return classSerialiser(CalendarInterviewInvitation, savedEvent);
  }

  /**
   * Retrieves the details of a scheduled event by its hash ID.
   *
   * @param hash_id - The hash ID of the scheduled event.
   * @returns The details of the scheduled event.
   */
  async getEventInviteByHashId(
    hash_id: string,
  ): Promise<CalendarInterviewInvitation> {
    // Fetch the scheduled event from the repository using the hash ID
    const event = await this.eventInvitationRepository.findOne({
      where: { hash_id },
      relations: ['job_application_id', 'event_id', 'event_id.organiser_id'],
    });

    return classSerialiser(CalendarInterviewInvitation, event);
  }

  /**
   * Retrieves all pending event invitations for a specific user.
   *
   * @param user_id - The ID of the user for whom to fetch event invitations.
   * @returns A promise that resolves to an array of `CalendarInterviewInvitation` objects.
   */
  async getAllEventInvitations(
    user_id: number,
  ): Promise<CalendarInterviewInvitation[]> {
    // Fetch all event invitations from the repository
    const invitations = await this.eventInvitationRepository.find({
      where: {
        invitee_id: { id: user_id },
        status: REFERRAL_INVITE_STATUS.pending,
      },
      relations: ['job_application_id', 'event_id', 'event_id.organiser_id'],
    });

    return invitations.map((invitation) =>
      classSerialiser(CalendarInterviewInvitation, invitation),
    );
  }

  /**
   * Updates the status of an event invitation.
   *
   * @param id - The hash ID of the event invitation.
   * @param status - The new status of the event invitation.
   * @returns The updated event invitation.
   */
  async updateEventInvitation(
    id: number,
    inviteDto: CalendarInterviewInvitationDto,
    user_id: number,
  ): Promise<CalendarInterviewInvitation> {
    const { status } = inviteDto;
    const eventInvitation = await this.eventInvitationRepository.findOne({
      where: { id, invitee_id: { id: user_id } },
    });

    if (!eventInvitation) {
      throw new HttpException(EVENT_INVITATION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Update the status of the event invitation
    eventInvitation.status = status;

    // Save the updated event invitation to the repository
    const updatedInvitation =
      await this.eventInvitationRepository.save(eventInvitation);

    return classSerialiser(CalendarInterviewInvitation, updatedInvitation);
  }

  /**
   * Retrieves an authentication token for a specified room if the user is authorized.
   *
   * @param room_id - The ID of the room for which the token is requested.
   * @param user_details - The details of the user requesting the token.
   * @returns A promise that resolves to an object containing the authentication token.
   * @throws {HttpException} If the user is not authorized to join the scheduled event.
   */
  async getRoomAuthToken(
    room_id: string,
    user_details: User,
  ): Promise<{ token: string }> {
    const { id } = user_details;

    const user_id = id;

    // Find the scheduled event where the user is either the organiser or a joinee
    const scheduledEvent = await this.scheduleEventRepository.findOne({
      where: { hms_room_id: room_id },
      relations: ['organiser_id', 'joinee_id'],
    });

    // If no scheduled event is found, throw an unauthorized exception
    if (
      user_id == +scheduledEvent.organiser_id.id ||
      user_id == +scheduledEvent.joinee_id.id
    ) {
      // Get the authentication token from the HMS client
      const token = await this.hmsService.generateRoomAuthToken(
        room_id,
        user_details,
      );
      return { token: token };
    }

    throw new HttpException(
      NOT_AUTHORIZED_TO_JOIN_SCHEDULED_EVENT,
      HttpStatus.UNAUTHORIZED,
    );
  }

  /**
   * Retrieves completed interviews for a user's public profile.
   *
   * @param hash_id - The hash_id of the user whose completed interviews are to be retrieved.
   * @returns A list of completed interviews.
   */
  async getCompletedInterviewsOnPublicProfile(hash_id: string): Promise<any> {
    const currentDateTime = new Date().toISOString();

    // Fetch the user from the repository
    // const user = await this.usersService.findPublicProfile(hash_id);

    // Fetch completed interviews from the repository
    const completedInterviews = await this.scheduleEventRepository.find({
      where: [
        {
          joinee_id: { hash_id },
          is_enabled: false,
        },
        {
          joinee_id: { hash_id },
          end_time_in_utc: LessThan(currentDateTime),
        },
        {
          organiser_id: { hash_id },
          is_enabled: false,
        },
        {
          organiser_id: { hash_id },
          end_time_in_utc: LessThan(currentDateTime),
        },
      ],
      relations: [
        'organiser_id',
        'joinee_id',
        'interview_ratings',
        'ai_interview_analysis',
      ],
      order: {
        end_time_in_utc: 'DESC',
      },
    });

    return completedInterviews.map((interview) =>
      classSerialiser(CalendarScheduledInterview, interview),
    );
  }

  /**
   * Ends a scheduled interview call by updating its status and end time.
   *
   * @param event_id - The ID of the scheduled event to be ended.
   * @param user_id - The ID of the user ending the call.
   * @returns The updated scheduled event.
   */
  async endScheduledInterviewCall(
    event_id: number,
    user_id: number,
  ): Promise<CalendarScheduledInterview> {
    // Fetch the scheduled event from the repository
    const event = await this.scheduleEventRepository.findOne({
      where: { id: event_id, organiser_id: { id: user_id } },
    });

    if (!event) {
      throw new HttpException(
        SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED,
        HttpStatus.NOT_FOUND,
      );
    }

    event.is_enabled = false;

    // Disable the room using the HMS service
    const roomEnabled = false;
    await this.hmsService.enableOrDisableRoom(event.hms_room_id, roomEnabled);

    // Save the updated event to the repository
    const updatedEvent = await this.scheduleEventRepository.save(event);

    return classSerialiser(CalendarScheduledInterview, updatedEvent);
  }

  /**
   * Reschedules an existing event to a new time slot.
   *
   * @param event_id - The ID of the event to be rescheduled.
   * @param scheduleEventDto - Data Transfer Object containing new event details.
   * @param user - The user rescheduling the event.
   * @returns The rescheduled event.
   */
  async rescheduleEvent(
    scheduled_event_id: number,
    scheduleEventDto: CalendarScheduleEventDto,
    user: User,
  ): Promise<CalendarScheduledInterview> {
    // Fetch the existing scheduled event from the repository
    const event = await this.scheduleEventRepository.findOne({
      where: { id: scheduled_event_id },
      relations: ['organiser_id', 'joinee_id'],
    });

    if (!event) {
      throw new HttpException(
        SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED,
        HttpStatus.NOT_FOUND,
      );
    }
    // throw error if user is not the organiser or joinee
    if (event.organiser_id.id !== user.id && event.joinee_id.id !== user.id) {
      throw new HttpException(
        NOT_AUTHORIZED_TO_SCHEDULE_EVENT,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Determine timezone, defaulting to the user's timezone if not provided in the DTO
    const userTimezone = scheduleEventDto.timezone
      ? scheduleEventDto.timezone
      : user.timezone;

    // Convert the new start time and end time to UTC
    const new_start_time_in_utc = convertDateTimeZone(
      scheduleEventDto.interview_date,
      scheduleEventDto.start_time,
      userTimezone,
      'UTC',
    );
    const new_end_time_in_utc = convertDateTimeZone(
      scheduleEventDto.interview_date,
      scheduleEventDto.end_time,
      userTimezone,
      'UTC',
    );

    // Update the event with new times
    event.start_time_in_utc = new_start_time_in_utc;
    event.end_time_in_utc = new_end_time_in_utc;

    // Save the updated event to the repository
    const updatedEvent = await this.scheduleEventRepository.save(event);

    return classSerialiser(CalendarScheduledInterview, updatedEvent);
  }

  /**
   * Retrieves completed interviews for a user's public profile.
   *
   * @param hash_id - The hash_id of the user whose completed interviews are to be retrieved.
   * @returns A list of completed interviews.
   */
  async getInterviewDetailsViaHmsRoomId(hms_room_id: string): Promise<any> {
    // Fetch completed interviews from the repository
    const interview = await this.scheduleEventRepository.findOne({
      where: [
        {
          hms_room_id: hms_room_id,
        },
      ],
      relations: [
        'organiser_id',
        'joinee_id',
        'interview_ratings',
        'ai_interview_analysis',
      ],
      order: {
        end_time_in_utc: 'DESC',
      },
    });

    const hmsRoomRecordings =
      await this.hmsService.getRoomRecordings(hms_room_id);

    const interviewDetails = {
      ...interview,
      hms_recordings: hmsRoomRecordings,
    };

    return classSerialiser(CalendarScheduledInterview, interviewDetails);
  }
}
