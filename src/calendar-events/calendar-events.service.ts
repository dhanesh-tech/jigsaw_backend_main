import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import {
  CalendarEventDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto';
import {
  CALENDAR_EVENT_CUSTOME_FIELD_NOT_FOUND,
  CALENDAR_EVENT_NOT_FOUND,
} from 'src/_jigsaw/constants';
import { CalendarEventCustomField } from './entities/calendar-event-custom-question.entity';
import {
  CalendarEventCustomFieldDto,
  UpdateCalendarEventCustomFieldDto,
} from './dto/calendar-event-custom-field.dto';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { CalendarAvailabilityEvent } from 'src/calendar-availability/entities/calendar-availability-event.entity';

@Injectable()
export class CalendarEventsService {
  constructor(
    @InjectRepository(CalendarEvent)
    private calendarEventRepository: Repository<CalendarEvent>,

    @InjectRepository(CalendarEventCustomField)
    private customFieldRepository: Repository<CalendarEventCustomField>,

    @InjectRepository(CalendarAvailabilityEvent)
    private availabilityEventRepository: Repository<CalendarAvailabilityEvent>,
  ) {}

  /**
   * Creates a new calendar event.
   * @param calendarEventDto - Data transfer object containing event details.
   * @param user_id - ID of the user creating the event.
   * @returns The created calendar event.
   */
  async createCalendarEvent(
    calendarEventDto: CalendarEventDto,
    user_id: number,
  ): Promise<CalendarEvent> {
    const calendarEvent = await this.calendarEventRepository.create({
      ...calendarEventDto,
      organiser_id: { id: user_id },
    });
    const savedEvent = await this.calendarEventRepository.save(calendarEvent);
    return classSerialiser(CalendarEvent, savedEvent);
  }

  /**
   * Retrieves all calendar events for a specific user.
   * @param user_id - ID of the user whose events are to be retrieved.
   * @returns A list of calendar events.
   */
  async findAllCalendarEvent(user_id: number): Promise<CalendarEvent[]> {
    const events = await this.calendarEventRepository.find({
      where: { organiser_id: { id: user_id } },
    });
    return events.map((event) => classSerialiser(CalendarEvent, event));
  }

  /**
   * Retrieves a specific calendar event by its ID and user ID.
   * @param id - ID of the calendar event.
   * @param user_id - ID of the user who owns the event.
   * @returns The calendar event if found.
   */
  async findOneCalendarEvent(
    id: number,
    user_id: number,
  ): Promise<CalendarEvent> {
    const event = await this.calendarEventRepository.findOne({
      where: { id, organiser_id: { id: user_id } },
    });

    if (!event) {
      throw new HttpException(CALENDAR_EVENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return classSerialiser(CalendarEvent, event);
  }

  /**
   * Retrieves a public calendar event by its hash ID and user ID.
   * @param hash_id - Hash ID of the calendar event.
   * @returns The public calendar event if found.
   */
  async findPublicCalendarEvent(hash_id: string): Promise<CalendarEvent> {
    const event = await this.calendarEventRepository.findOne({
      where: { hash_id: hash_id },
      relations: ['organiser_id', 'custom_fields'],
    });

    if (!event) {
      throw new HttpException(CALENDAR_EVENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const eventAvailability = await this.availabilityEventRepository.findOne({
      where: { event_id: { id: event.id } },
      relations: ['availability_id'],
    });

    if (eventAvailability) {
      event['event_availability'] = eventAvailability;
    }

    return classSerialiser(CalendarEvent, event);
  }

  /**
   * Updates a specific calendar event.
   * @param id - ID of the calendar event to be updated.
   * @param updateCalendarEventDto - Data transfer object containing updated event details.
   * @param user_id - ID of the user who owns the event.
   * @returns The updated calendar event.
   */
  async updateCalendarEvent(
    id: number,
    updateCalendarEventDto: UpdateCalendarEventDto,
    user_id: number,
  ): Promise<CalendarEvent> {
    const existingEvent = await this.calendarEventRepository.findOne({
      where: { id, organiser_id: { id: user_id } },
    });

    if (!existingEvent) {
      throw new HttpException(CALENDAR_EVENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.calendarEventRepository.update(id, updateCalendarEventDto);
    const updatedEvent = await this.calendarEventRepository.findOne({
      where: { id, organiser_id: { id: user_id } },
    });

    return classSerialiser(CalendarEvent, updatedEvent);
  }

  /**
   * Removes a specific calendar event.
   * @param id - ID of the calendar event to be removed.
   * @param user_id - ID of the user who owns the event.
   */
  async removeCalendarEvent(id: number, user_id: number): Promise<void> {
    const existingEvent = await this.calendarEventRepository.findOne({
      where: { id, organiser_id: { id: user_id } },
    });

    if (!existingEvent) {
      throw new HttpException(CALENDAR_EVENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.calendarEventRepository.delete(id);
  }

  /**
   * Adds a custom field to a specific calendar event.
   * @param customFieldDto - Data transfer object containing custom field details.
   * @param user_id - ID of the user who owns the event.
   * @returns The created custom field.
   */
  async createCustomField(
    customFieldDto: CalendarEventCustomFieldDto,
    user_id: number,
  ): Promise<CalendarEventCustomField> {
    const { calendar_event_id } = customFieldDto;
    const event = await this.calendarEventRepository.findOne({
      where: { id: calendar_event_id, organiser_id: { id: user_id } },
    });

    if (!event) {
      throw new HttpException(CALENDAR_EVENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const customField = await this.customFieldRepository.create({
      ...customFieldDto,
      calendar_event_id: { id: calendar_event_id },
    });

    const savedCustomField = await this.customFieldRepository.save(customField);
    return classSerialiser(CalendarEventCustomField, savedCustomField);
  }

  /**
   * Updates a custom field of a specific calendar event.
   * @param id - ID of the custom field to be updated.
   * @param customFieldDto - Data transfer object containing updated custom field details.
   * @param user_id - ID of the user who owns the event.
   * @returns The updated custom field.
   */
  async updateCustomField(
    id: number,
    customFieldDto: UpdateCalendarEventCustomFieldDto,
    user_id: number,
  ): Promise<CalendarEventCustomField> {
    const { is_required, question_text } = customFieldDto;
    const customField = await this.customFieldRepository.findOne({
      where: { id, calendar_event_id: { organiser_id: { id: user_id } } },
    });

    if (!customField) {
      throw new HttpException(
        CALENDAR_EVENT_CUSTOME_FIELD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.customFieldRepository.update(id, { is_required, question_text });
    const updatedCustomField = await this.customFieldRepository.findOne({
      where: { id },
    });

    return classSerialiser(CalendarEventCustomField, updatedCustomField);
  }

  /**
   * Removes a custom field from a specific calendar event.
   * @param id - ID of the custom field to be removed.
   * @param user_id - ID of the user who owns the event.
   */
  async removeCustomField(id: number, user_id: number): Promise<void> {
    const customField = await this.customFieldRepository.findOne({
      where: { id: id, calendar_event_id: { organiser_id: { id: user_id } } },
    });

    if (!customField) {
      throw new HttpException(
        CALENDAR_EVENT_CUSTOME_FIELD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.customFieldRepository.delete(id);
  }

  /**
   * Retrieves all custom fields of a specific calendar event.
   * @param event_id - ID of the calendar event.
   * @returns An object containing all custom fields of the event.
   */
  async findAllCustomFields(
    event_id: number,
  ): Promise<CalendarEventCustomField[]> {
    const customFields = await this.customFieldRepository.find({
      where: {
        calendar_event_id: { id: event_id },
      },
    });

    return customFields.map((field) =>
      classSerialiser(CalendarEventCustomField, field),
    );
  }
}
