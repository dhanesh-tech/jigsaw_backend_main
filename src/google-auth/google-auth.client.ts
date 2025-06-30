import { Injectable } from '@nestjs/common';
import {
  Credentials,
  LoginTicket,
  OAuth2Client,
  TokenPayload,
} from 'google-auth-library';
import { ERROR_GETTING_PROFILE_FROM_GOOGLE } from 'src/_jigsaw/constants';

import {
  BACKEND_ROOT_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from 'src/_jigsaw/envDefaults';
import {
  GOOGLE_AUTH_ACCESS_TYPE,
  GOOGLE_AUTH_INCLUDE_GRANTED_SCOPES,
  GOOGLE_AUTH_REDIRECT_URI,
  GOOGLE_AUTH_SCOPES,
} from './utilities/constants';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import { GoogleCalendarEventDto } from './dto/google-calendar-event.dto';
import { Logger } from '@nestjs/common';
import { calendar } from '@googleapis/calendar';

@Injectable()
export class GoogleAuthClient {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(GoogleAuthClient.name);

  constructor() {
    const redirectUri = `${BACKEND_ROOT_URL}${GOOGLE_AUTH_REDIRECT_URI}`;
    this.googleClient = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri,
    );
  }

  /**
   * Retrieves user metadata information from a Google ID token.
   *
   * @param token - The Google ID token to verify and extract user information from.
   * @returns A promise that resolves to a partial `RegisterDto` object containing the user's email and full name.
   * @throws An error if there is an issue verifying the token or extracting the user information.
   */
  async getUserMetaInfo(token: string): Promise<TokenPayload> {
    try {
      const ticket: LoginTicket = await this.googleClient.verifyIdToken({
        idToken: token,
      });
      const payload: TokenPayload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new Error(`${ERROR_GETTING_PROFILE_FROM_GOOGLE} ${error}`);
    }
  }

  /**
   * Generates an authentication URL for the Google OAuth2.0 authorization flow.
   *
   * @returns A promise that resolves to the authentication URL.
   */
  async getAuthenticationUrl(): Promise<string> {
    return this.googleClient.generateAuthUrl({
      access_type: GOOGLE_AUTH_ACCESS_TYPE,
      scope: GOOGLE_AUTH_SCOPES,
      include_granted_scopes: GOOGLE_AUTH_INCLUDE_GRANTED_SCOPES,
    });
  }

  /**
   * Retrieves an access token from Google using an authorization code.
   *
   * @param code - The authorization code received from Google.
   * @returns A promise that resolves to the access token.
   */
  async getAuthTokens(code: string): Promise<GetTokenResponse> {
    const token = await this.googleClient.getToken(code);
    return token;
  }

  /**
   * Retrieves Google Calendar events for a specific date.
   *
   * @param date - The date for which to retrieve calendar events. This should be a valid Date object.
   * @param tokens - The credentials object containing the access token required for authentication.
   * @returns A promise that resolves to the list of events for the specified date.
   * @throws An error if there is an issue retrieving the events from the Google Calendar API.
   */
  async getGoogleCalendarEventsOnDate(
    startOfDay: string,
    endOfDay: string,
    timezone: string,
    tokens: Credentials,
  ): Promise<any> {
    // set credentials
    await this.googleClient.setCredentials(tokens);

    // calendar client instance
    const calendarClient = calendar({
      version: 'v3',
      auth: this.googleClient,
    });

    // fetch events of the day
    const eventsResponse = await calendarClient.events.list({
      calendarId: 'primary',
      timeZone: timezone,
      timeMin: startOfDay,
      timeMax: endOfDay,
    });

    const eventItems = eventsResponse.data?.items || [];

    return eventItems;
  }

  /**
   * Creates a new Google Calendar event.
   *
   * @param event - The event details to be created in Google Calendar.
   * @param tokens - The credentials object containing the access token required for authentication.
   * @returns A promise that resolves to the response from the Google Calendar API after the event is created.
   * @throws An error if there is an issue creating the event in Google Calendar.
   */
  async createGoogleCalendarEvent(
    event: GoogleCalendarEventDto,
    tokens: Credentials,
  ) {
    await this.googleClient.setCredentials(tokens);
    // calendar client instance
    const calendarClient = calendar({
      version: 'v3',
      auth: this.googleClient,
    });

    const response = await calendarClient.events.insert({
      calendarId: 'primary',
      auth: this.googleClient,
      requestBody: {
        summary: event.title,
        start: event.startTime,
        end: event.endTime,
        description: event.description,
        attendees: event.attendees,
      },
    });
    this.logger.log(`Event created on Google Calendar: ${response.data.id}`);

    return response;
  }
}
