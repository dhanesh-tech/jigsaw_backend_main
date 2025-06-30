import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { SCHEDULED_INTERVIEW_URL } from 'src/_jigsaw/frontendUrlsConst';
import { GoogleAuthService } from 'src/google-auth/google-auth.service';
import {
  CALENDAR_EVENT_SCHEDULED,
  CALENDAR_EVENT_SCHEDULED_EMAIL_SEND,
} from 'src/_jigsaw/eventSignalConstants';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';
import { GoogleCalendarEventDto } from 'src/google-auth/dto/google-calendar-event.dto';
import {
  JIGSAW_CALENDAR_INTERVIEW_TITLE,
  JIGSAW_CALENDAR_INTERVIEW_DESCRIPTION,
  ERROR_HANDLING_EVENT,
  ERROR_TEMPLATE_NOT_FOUND,
} from 'src/_jigsaw/constants';
import { UserTimezoneConstants } from 'src/_jigsaw/enums';
import * as fs from 'fs';
import * as path from 'path';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import {
  convertDateToStartOfDay,
  convertTimeZone,
} from 'src/_jigsaw/helpersFunc';
@Injectable()
export class CalendarScheduledEventListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly logger: Logger,
  ) {}

  /**
   * Handles the event when a calendar interview is scheduled.
   * This method is triggered by the CALENDAR_EVENT_SCHEDULED event.
   * It creates a Google Calendar event for the scheduled interview
   * and sends invites to the participants.
   *
   * @param scheduledEvent - The details of the scheduled interview event.
   * @throws Error if there is an issue creating the Google Calendar event.
   */
  @OnEvent(CALENDAR_EVENT_SCHEDULED)
  async handleCalendarScheduledEvent(
    scheduledEvent: CalendarScheduledInterview,
  ) {
    try {
      // Destructure the necessary properties from the scheduled event
      const {
        id,
        hms_room_id,
        joinee_id,
        organiser_id,
        start_time_in_utc,
        end_time_in_utc,
      } = scheduledEvent;

      // Create a new Google Calendar event DTO
      const googleCalendarEvent = new GoogleCalendarEventDto();
      googleCalendarEvent.title = JIGSAW_CALENDAR_INTERVIEW_TITLE; // Set the event title
      googleCalendarEvent.description = JIGSAW_CALENDAR_INTERVIEW_DESCRIPTION(
        SCHEDULED_INTERVIEW_URL(id, hms_room_id), // Set the event description with a link to the interview room
      );
      googleCalendarEvent.startTime = {
        dateTime: start_time_in_utc, // Set the start time in UTC
        timeZone: UserTimezoneConstants.UTC, // Specify the time zone
      };
      googleCalendarEvent.endTime = {
        dateTime: end_time_in_utc, // Set the end time in UTC
        timeZone: UserTimezoneConstants.UTC, // Specify the time zone
      };

      // Define the attendees for the event
      googleCalendarEvent.attendees = [
        {
          email: joinee_id.email, // Joinee's email
          displayName: joinee_id.full_name, // Joinee's full name
        },
        {
          email: organiser_id.email, // Organiser's email
          displayName: organiser_id.full_name, // Organiser's full name
        },
      ];

      // Collect user IDs for creating the calendar event
      const userIds = [joinee_id.id, organiser_id.id];

      // Create the Google Calendar event using the GoogleAuthService
      await this.googleAuthService.createGoogleCalendarEvent(
        googleCalendarEvent,
        userIds,
      );

      // Log the successful creation of the event
      this.logger.log(`Event created on Google Calendar: ${id}`);
    } catch (error) {
      // Handle any errors that occur during the event creation process
      throw new Error(
        `${ERROR_HANDLING_EVENT},
                ${CALENDAR_EVENT_SCHEDULED}`,
      );
    }
  }

  /**
   * Handles the event when an email needs to be sent for a scheduled calendar interview.
   * This method is triggered by the CALENDAR_EVENT_SCHEDULED_EMAIL_SEND event.
   * It retrieves the necessary details from the scheduled event, reads the email template,
   * replaces placeholders with dynamic values, and sends the email to the participants.
   *
   * @param scheduledEvent - The details of the scheduled interview event.
   * @throws Error if there is an issue reading the email template or sending the email.
   */
  @OnEvent(CALENDAR_EVENT_SCHEDULED_EMAIL_SEND)
  async handleCalendarScheduledEventEmailSend(
    scheduledEvent: CalendarScheduledInterview,
  ) {
    try {
      const { id, hms_room_id, joinee_id, organiser_id, start_time_in_utc } =
        scheduledEvent;

      // Path to the email template
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'interview-scheduled.html',
      );
      let templateContent: string;
      // Check if the template file exists and read its content else throw error
      try {
        await fs.promises.access(templatePath);
        templateContent = await fs.promises.readFile(templatePath, 'utf8');
      } catch (error) {
        // this will log to sentry
        throw new Error(`${ERROR_TEMPLATE_NOT_FOUND}: ${templatePath}`);
      }

      const interview_schedule_link = SCHEDULED_INTERVIEW_URL(id, hms_room_id);

      let joineeTemplateContent = templateContent;
      let organiserTemplateContent = templateContent;

      // Replace placeholders in the template with dynamic values
      joineeTemplateContent = joineeTemplateContent
        .replace(
          '{{interview_date}}',
          convertDateToStartOfDay(start_time_in_utc, joinee_id.timezone),
        )
        .replace(
          '{{start_time}}',
          convertTimeZone(
            start_time_in_utc,
            UserTimezoneConstants.UTC,
            joinee_id.timezone,
          ),
        )
        .replace('{{joinee_name}}', joinee_id?.full_name)
        .replace('{{organiser_name}}', organiser_id?.full_name)
        .replace('{{interview_schedule_link}}', interview_schedule_link);

      // Prepare the email DTO with the recipient, subject, and body
      const joineeEmailDto: SendEmailDto = {
        recipient: joinee_id.email,
        subject: JIGSAW_CALENDAR_INTERVIEW_TITLE,
        body: joineeTemplateContent,
      };

      await this.emailService.sendSendgridEmail(joineeEmailDto);

      // Replace placeholders in the template with dynamic values
      organiserTemplateContent = organiserTemplateContent
        .replace(
          '{{interview_date}}',
          convertDateToStartOfDay(start_time_in_utc, organiser_id.timezone),
        )
        .replace(
          '{{start_time}}',
          convertTimeZone(
            start_time_in_utc,
            UserTimezoneConstants.UTC,
            organiser_id.timezone,
          ),
        )
        .replace('{{joinee_name}}', joinee_id?.full_name)
        .replace('{{organiser_name}}', organiser_id?.full_name)
        .replace('{{interview_schedule_link}}', interview_schedule_link);

      // Prepare the email DTO with the recipient, subject, and body
      const organiserEmailDto: SendEmailDto = {
        recipient: organiser_id.email,
        subject: JIGSAW_CALENDAR_INTERVIEW_TITLE,
        body: organiserTemplateContent,
      };

      await this.emailService.sendSendgridEmail(organiserEmailDto);
    } catch (error) {
      throw new Error(
        `${ERROR_HANDLING_EVENT},
                ${CALENDAR_EVENT_SCHEDULED_EMAIL_SEND}`,
      );
    }
  }
}
