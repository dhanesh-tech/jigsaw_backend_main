import { Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { CalendarScheduledInterviewService } from './calendar-scheduled-event.service';
import { CalendarScheduleEventDto } from './dto/calendar-schedule-interview.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CalendarInterviewInvitationDto } from './dto/calandar-interview-invitation.dto';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';

@Controller('v1/schedule-event')
export class CalendarScheduledInterviewController {
  constructor(
    private readonly calendarScheduledInterviewService: CalendarScheduledInterviewService,
  ) {}

  /**
   * Schedules an event based on the provided availability ID and event details.
   *
   * /v1/schedule-event/availability/:id
   * @param id - The ID of the availability slot.
   * @param scheduleEventDto - The details of the event to be scheduled.
   * @param req - The request object containing user information.
   * @returns The scheduled event details.
   */
  @Post('/availability/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async scheduleEvent(
    @Param('id') id: number,
    @Body() scheduleEventDto: CalendarScheduleEventDto,
    @Req() req: any,
  ) {
    const user = req?.user;
    return this.calendarScheduledInterviewService.scheduleEvent(
      id,
      scheduleEventDto,
      user,
    );
  }

  /**
   * Retrieves the details of a scheduled event by its ID.
   *
   * /v1/schedule-event/:id
   * @param req - The request object containing user information.
   * @param id - The ID of the scheduled event.
   * @returns The details of the scheduled event.
   */
  @Get('/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async getScheduledEventDetail(@Req() req: any, @Param('id') id: number) {
    const user_id = req?.user?.id;
    return this.calendarScheduledInterviewService.getScheduledEventDetail(
      +id,
      +user_id,
    );
  }

  /**
   * Retrieves the upcoming scheduled events for the authenticated user.
   *
   * /v1/schedule-event/upcoming/all
   * @param req - The request object containing user information.
   * @returns A list of upcoming scheduled events.
   */
  @Get('/upcoming/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async getUpcomingScheduledEvents(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarScheduledInterviewService.getUpcomingScheduledEvents(
      +user_id,
    );
  }

  /**
   * Retrieves the past scheduled events for the authenticated user.
   *
   * /v1/schedule-event/past/all
   * @param req - The request object containing user information.
   * @returns A list of past scheduled events.
   */
  @Get('/past/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async getPastScheduledEvents(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarScheduledInterviewService.getPastScheduledEvents(
      +user_id,
    );
  }

  /**
   * Invites a user to a scheduled event.
   *
   * /v1/schedule-event/invite/send
   * @param req - The request object containing user information.
   * @param inviteDto - The details of the invitation.
   * @returns The details of the invitation.
   */
  @Post('/invite/send')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async inviteUserToEvent(
    @Req() req: any,
    @Body() inviteDto: CalendarInterviewInvitationDto,
  ) {
    const user_id = req?.user?.id;
    return this.calendarScheduledInterviewService.inviteUserToEvent(
      inviteDto,
      user_id,
    );
  }

  /**
   * Accepts an invitation to a scheduled event.
   *
   * /v1/schedule-event/invite/details/:hash_id
   * @param req - The request object containing user information.
   * @param hash_id - The hash ID of the invitation.
   * @returns The details of the scheduled event.
   */
  @Get('/invite/details/:hash_id')
  @UseGuards(PublicAuthGuard)
  // todo -> check with the team if we need to add role guard here and what role should be added
  async getInviteDetails(@Req() req: any, @Param('hash_id') hash_id: string) {
    return this.calendarScheduledInterviewService.getEventInviteByHashId(
      hash_id,
    );
  }

  /**
   * get all invitations
   *
   * /v1/schedule-event/invite/all
   * @param req - The request object containing user information.
   * @param hash_id - The hash ID of the invitation.
   * @returns The details of the scheduled event.
   */
  @Get('/invite/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async getAllInvitations(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarScheduledInterviewService.getAllEventInvitations(
      user_id,
    );
  }

  /**
   * Accepts an invitation to a scheduled event.
   *
   * /v1/schedule-event/invite/:id
   * @param req - The request object containing user information.
   * @param hash_id - The hash ID of the invitation.
   * @returns The details of the scheduled event.
   */
  @Put('/invite/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async updateEventInvitation(
    @Req() req: any,
    @Body() inviteDto: CalendarInterviewInvitationDto,
    @Param('id') id: number,
  ) {
    const user_id = req?.user?.id;
    return this.calendarScheduledInterviewService.updateEventInvitation(
      id,
      inviteDto,
      user_id,
    );
  }

  /**
   * Retrieve an authentication token for a specific room.
   *
   * Endpoint: /v1/schedule-event/auth-token/:room_id
   * @param room_id - The ID of the room for which the auth token is requested.
   * @param req - The request object containing user information.
   * @returns The generated authentication token for the room.
   */
  @Get('/auth-token/:room_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.candidate,
    USER_ROLE.recruiter,
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
  )
  async getRoomAuthToken(@Param('room_id') room_id: string, @Req() req: any) {
    const user_details = req.user;
    return await this.calendarScheduledInterviewService.getRoomAuthToken(
      room_id,
      user_details,
    );
  }

  /**
   * Retrieves all completed interviews on the public profile of a candidate.
   *
   * /v1/schedule-event/public/completed-interviews/:hash_id
   * @param hash_id - The hash id of the candidate.
   * @returns A list of completed interviews for the candidate.
   */
  @Get('/public/completed-interviews/:hash_id')
  @UseGuards(PublicAuthGuard)
  async getCompletedInterviewsOnPublicProfile(
    @Param('hash_id') hash_id: string,
  ) {
    return this.calendarScheduledInterviewService.getCompletedInterviewsOnPublicProfile(
      hash_id,
    );
  }

  /**
   * Ends a scheduled interview call.
   * /v1/schedule-event/end-interview/:event_id
   * @param event_id - The ID of the room where the interview is taking place.
   * @param req - The request object containing user information.
   * @returns A promise that resolves when the scheduled interview call is ended.
   */
  @Put('/end-interview/:event_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.candidate,
    USER_ROLE.recruiter,
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
  )
  async endScheduledInterviewCall(
    @Param('event_id') event_id: string,
    @Req() req: any,
  ) {
    const user_id = req.user.id;
    return this.calendarScheduledInterviewService.endScheduledInterviewCall(
      +event_id,
      +user_id,
    );
  }

  /**
   * Reschedules an existing event.
   *
   * /v1/schedule-event/reschedule/:scheduled_event_id
   * @param scheduled_event_id - The ID of the scheduled event.
   * @param scheduleEventDto - The new details of the event to be rescheduled.
   * @param req - The request object containing user information.
   * @returns The rescheduled event details.
   */
  @Put('/reschedule/:scheduled_event_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  async rescheduleEvent(
    @Param('scheduled_event_id') scheduled_event_id: number,
    @Body() scheduleEventDto: CalendarScheduleEventDto,
    @Req() req: any,
  ) {
    const user = req?.user;
    return this.calendarScheduledInterviewService.rescheduleEvent(
      scheduled_event_id,
      scheduleEventDto,
      user,
    );
  }

  /**
   * Retrieves the details of a completed interview by its HMS room ID.
   *
   * /v1/schedule-event/interview/:hms_room_id
   * @param hms_room_id - The ID of the HMS room.
   * @returns The details of the completed interview.
   */
  @Get('/interview/:hms_room_id')
  async getInterviewDetailsViaHmsRoomId(
    @Param('hms_room_id') hms_room_id: string,
  ) {
    return this.calendarScheduledInterviewService.getInterviewDetailsViaHmsRoomId(
      hms_room_id,
    );
  }
}
