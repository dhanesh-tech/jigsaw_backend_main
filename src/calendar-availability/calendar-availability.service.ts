import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarAvailability } from './entities/calendar-availabilty.entity';
import { CalendarAvailabilityDto } from './dto/calendar-availability.dto';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import {
  CALENDAR_AVAILABILITY_NOT_FOUND,
  CALENDAR_AVAILABILITY_TIMING_NOT_FOUND,
  CALENDAR_EVENT_AVAILABILITY_NOT_FOUND,
  CALENDAR_EVENT_NOT_FOUND,
  WEEK_SPECIFIC_DATE_REQUIRED,
} from 'src/_jigsaw/constants';
import { CalendarAvailabilityTiming } from './entities/calendar-availability-timing.entity';
import {
  AdjustedSlotInterface,
  CalendarAvailabilityTimingDto,
  DateSpecificAvailabilityDto,
} from './dto/calendar-availability-timing.dto';
import { CalendarAvailabilityEventDto } from './dto/calendar-availability-event.dto';
import { CalendarAvailabilityEvent } from './entities/calendar-availability-event.entity';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';
import { User } from 'src/users/entities/user.entity';
import {
  convertUserTimezoneToUtc,
  formatUtcToUserTimezone,
  getAvailableSlots,
} from './utilities/helpers';

@Injectable()
export class CalendarAvailabilityService {
  constructor(
    @InjectRepository(CalendarAvailability)
    private availabilityRepository: Repository<CalendarAvailability>,

    @InjectRepository(CalendarAvailabilityTiming)
    private availabilityTimingRepository: Repository<CalendarAvailabilityTiming>,

    @InjectRepository(CalendarAvailabilityEvent)
    private availabilityEventRepository: Repository<CalendarAvailabilityEvent>,

    @InjectRepository(CalendarEvent)
    private eventRepository: Repository<CalendarEvent>,
  ) {}

  /**
   * Creates a new calendar availability entry for a user.
   *
   * @param calendarAvailabilityDto - Data transfer object containing the details of the calendar availability.
   * @param user_id - The ID of the user for whom the availability is being created.
   * @returns A promise that resolves to the created CalendarAvailability object.
   */
  async createAvailability(
    calendarAvailabilityDto: CalendarAvailabilityDto,
    user_id: number,
  ): Promise<CalendarAvailability> {
    const newAvailability = await this.availabilityRepository.create({
      ...calendarAvailabilityDto,
      user_id: { id: user_id },
    });

    const savedAvailability =
      await this.availabilityRepository.save(newAvailability);

    return classSerialiser(CalendarAvailability, savedAvailability);
  }

  /**
   * Retrieves all calendar availability entries for the authenticated user.
   *
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<CalendarAvailability[]>} A promise that resolves to an array of calendar availability entries.
   */
  async findAllAvailability(user_id: number): Promise<CalendarAvailability[]> {
    const availabilities = await this.availabilityRepository.find({
      where: { user_id: { id: user_id } },
    });
    // todo: format the timings to availability timezone to be done later as not required now
    return availabilities.map((availability) =>
      classSerialiser(CalendarAvailability, availability),
    );
  }

  /**
   * Retrieves a single calendar availability entry for the authenticated user.
   *
   * @param {number} user_id - The ID of the authenticated user.
   * @param {number} id - The ID of the calendar availability entry.
   * @returns {Promise<CalendarAvailability>} A promise that resolves to the calendar availability entry or null if not found.
   */
  /**
   * Finds a single calendar availability by its ID and user ID.
   *
   * @param id - The ID of the calendar availability to find.
   * @param user_id - The ID of the user who owns the calendar availability.
   * @returns A promise that resolves to the found CalendarAvailability object.
   *  Format time in: 'HH:mm' format in availability timezone.
   */
  async findOneAvailability(
    id: number,
    user_id: number,
  ): Promise<CalendarAvailability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, user_id: { id: user_id } },
    });
    if (availability) {
      const timings = await this.availabilityTimingRepository.find({
        where: { availability_id: { id: availability.id } },
      });
      // Format the timings to availability timezone
      const formattedTimings = timings.map((timing) => {
        timing.start_time = formatUtcToUserTimezone(
          timing.start_time,
          availability.timezone,
        );
        timing.end_time = formatUtcToUserTimezone(
          timing.end_time,
          availability.timezone,
        );
        return timing;
      });
      availability['timings'] = formattedTimings;

      const events = await this.availabilityEventRepository.find({
        where: { availability_id: { id: availability.id } },
        relations: ['event_id'],
      });

      availability['events'] = events;
    }

    return classSerialiser(CalendarAvailability, availability);
  }

  /**
   * Updates a calendar availability entry for the authenticated user.
   *
   * @param {number} id - The ID of the calendar availability entry.
   * @param {CalendarAvailabilityDto} calendarAvailabilityDto - The updated calendar availability data.
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<CalendarAvailability>} A promise that resolves to the updated calendar availability entry.
   */
  async updateAvailability(
    id: number,
    calendarAvailabilityDto: CalendarAvailabilityDto,
    user_id: number,
  ): Promise<CalendarAvailability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, user_id: { id: user_id } },
    });
    if (!availability) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.availabilityRepository.update(id, calendarAvailabilityDto);
    const updatedAvailability = await this.availabilityRepository.findOne({
      where: { id, user_id: { id: user_id } },
    });
    return classSerialiser(CalendarAvailability, updatedAvailability);
  }

  /**
   * Removes a calendar availability entry for the authenticated user.
   *
   * @param {number} id - The ID of the calendar availability entry.
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<void>} A promise that resolves when the calendar availability entry is removed.
   */
  async removeAvailability(id: number, user_id: number): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, user_id: { id: user_id } },
    });
    if (!availability) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.availabilityRepository.remove(availability);
  }

  /**
   * Retrieves all calendar availability entries for a user by their hash ID.
   *
   * @param {string} user_hash_id - The hash ID of the user.
   * @returns {Promise<CalendarAvailability[]>} A promise that resolves to an array of calendar availability entries.
   */
  async findAvailabilityByUserHashId(
    user_hash_id: string,
  ): Promise<CalendarAvailability[]> {
    const availabilities = await this.availabilityRepository.find({
      where: { user_id: { hash_id: user_hash_id } },
    });

    return availabilities.map((availability) =>
      classSerialiser(CalendarAvailability, availability),
    );
  }

  /**
   * Adds a new timing entry to an existing calendar availability for the authenticated user.
   *
   * @param {CalendarAvailabilityTimingDto} timingDto - The timing data to be added.
   * @param {number} availability_id - The ID of the calendar availability entry.
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<CalendarAvailabilityTiming>} A promise that resolves to the newly added timing entry.
   */
  async addAvailabilityTiming(
    timingDto: CalendarAvailabilityTimingDto[],
    availability_id: number,
    user_id: number,
  ): Promise<CalendarAvailabilityTiming[]> {
    const existingAvailability = await this.availabilityRepository.findOne({
      where: { id: availability_id, user_id: { id: user_id } },
    });

    if (!existingAvailability) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    // Ensure that either week_day or specific_date is provided in the timing data.
    const formattedTimings = timingDto.map((timing) => {
      const validTiming = timing?.specific_date
        ? true
        : timing?.week_day === 0 || timing?.week_day;
      if (!validTiming) {
        throw new HttpException(
          WEEK_SPECIFIC_DATE_REQUIRED,
          HttpStatus.BAD_REQUEST,
        );
      }
      // convert the timing to UTC in timestalmp format: '2021-09-01T00:00:00.000Z'
      timing.start_time = convertUserTimezoneToUtc(
        timing.start_time,
        existingAvailability.timezone,
      );
      timing.end_time = convertUserTimezoneToUtc(
        timing.end_time,
        existingAvailability.timezone,
      );
      return {
        ...timing,
        availability_id: { id: availability_id },
      };
    });

    const newTiming =
      await this.availabilityTimingRepository.create(formattedTimings);
    const savedTiming = await this.availabilityTimingRepository.save(newTiming);

    return savedTiming.map((availabilityTiming) =>
      classSerialiser(CalendarAvailabilityTiming, availabilityTiming),
    );
  }

  /**
   * Updates an existing timing entry for a calendar availability for the authenticated user.
   *
   * @param {number} id - The ID of the timing entry.
   * @param {CalendarAvailabilityTimingDto} timingDto - The updated timing data.
   * @param {number} availability_id - The ID of the calendar availability entry.
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<CalendarAvailabilityTiming>} A promise that resolves to the updated timing entry.
   */
  async updateAvailabilityTiming(
    id: number,
    timingDto: CalendarAvailabilityTimingDto,
    availability_id: number,
    user_id: number,
  ): Promise<CalendarAvailabilityTiming> {
    const timing = await this.availabilityTimingRepository.findOne({
      where: {
        id,
        availability_id: { id: availability_id, user_id: { id: user_id } },
      },
      relations: ['availability_id'],
    });

    if (!timing) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_TIMING_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    // Ensure that either week_day or specific_date is provided in the timing data.
    const validTiming = timingDto?.specific_date
      ? true
      : timingDto?.week_day === 0 || timingDto?.week_day;
    if (!validTiming) {
      throw new HttpException(
        WEEK_SPECIFIC_DATE_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    // convert the timing to UTC in timestalmp format: '2021-09-01T00:00:00.000Z'
    timingDto.start_time = convertUserTimezoneToUtc(
      timingDto.start_time,
      timing.availability_id.timezone,
    );
    timingDto.end_time = convertUserTimezoneToUtc(
      timingDto.end_time,
      timing.availability_id.timezone,
    );

    await this.availabilityTimingRepository.update(id, timingDto);
    const updatedTiming = await this.availabilityTimingRepository.findOne({
      where: { id },
    });
    return classSerialiser(CalendarAvailabilityTiming, updatedTiming);
  }

  /**
   * Removes a timing entry from a calendar availability for the authenticated user.
   *
   * @param {number} id - The ID of the timing entry.
   * @param {number} availability_id - The ID of the calendar availability entry.
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<void>} A promise that resolves when the timing entry is removed.
   */
  async removeAvailabilityTiming(
    id: number,
    availability_id: number,
    user_id: number,
  ): Promise<void> {
    const timing = await this.availabilityTimingRepository.findOne({
      where: {
        id,
        availability_id: { id: availability_id, user_id: { id: user_id } },
      },
    });
    if (!timing) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.availabilityTimingRepository.remove(timing);
  }

  /**
   * Assigns an event to an existing calendar availability for the authenticated user.
   *
   * @param {CalendarAvailabilityEventDto} eventDto - The event data to be assigned.
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<CalendarAvailabilityEvent>} A promise that resolves to the updated calendar availability entry with the assigned event.
   */
  async assignEventToAvailability(
    eventDto: CalendarAvailabilityEventDto,
    user_id: number,
  ): Promise<CalendarAvailabilityEvent> {
    const { availability_id, event_id } = eventDto;
    const existingAvailability = await this.availabilityRepository.findOne({
      where: { id: availability_id, user_id: { id: user_id } },
    });

    if (!existingAvailability) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const existingEvent = await this.eventRepository.findOne({
      where: { id: event_id, organiser_id: { id: user_id } },
    });

    if (!existingEvent) {
      throw new HttpException(CALENDAR_EVENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const newEventAvailability = await this.availabilityEventRepository.create({
      availability_id: { id: availability_id },
      event_id: { id: event_id },
    });
    const savedEventAvailability =
      await this.availabilityEventRepository.save(newEventAvailability);
    return classSerialiser(CalendarAvailabilityEvent, savedEventAvailability);
  }

  /**
   * Assigns an event to an existing calendar availability for the authenticated user.
   *
   * @param {CalendarAvailabilityEventDto} eventDto - The event data to be assigned.
   * @param {number} user_id - The ID of the authenticated user.
   * @returns {Promise<CalendarAvailabilityEvent>} A promise that resolves to the updated calendar availability entry with the assigned event.
   */
  async removeAvailabilityEvent(id: number, user_id: number): Promise<void> {
    const existingEventAvailability =
      await this.availabilityEventRepository.findOne({
        where: { id },
        relations: ['availability_id', 'availability_id.user_id'],
      });

    if (
      !existingEventAvailability ||
      existingEventAvailability?.availability_id?.user_id?.id !== user_id
    ) {
      throw new HttpException(
        CALENDAR_EVENT_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.availabilityEventRepository.remove(existingEventAvailability);
  }

  /**
   * Retrieves all available slots for a given calendar availability entry for the authenticated user.
   *
   * @param {number} hash_id - The ID of the calendar availability entry.
   * @param {number} user - The ID of the authenticated user.
   * @returns {Promise<AdjustedSlot[]>} A promise that resolves to an array of available slots.
   */
  async findAllAvailableSlots(
    hash_id: string,
    dateDto: DateSpecificAvailabilityDto,
    user: User,
  ): Promise<AdjustedSlotInterface[]> {
    const { specific_date, timezone } = dateDto;

    const userTimezone = timezone ? timezone : user.timezone;

    const availability = await this.availabilityRepository.findOne({
      where: { hash_id },
      relations: ['timings'],
    });

    if (!availability) {
      throw new HttpException(
        CALENDAR_AVAILABILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const availableSlots: AdjustedSlotInterface[] = getAvailableSlots(
      specific_date,
      userTimezone,
      availability.timings,
    );

    return availableSlots;
  }
}
