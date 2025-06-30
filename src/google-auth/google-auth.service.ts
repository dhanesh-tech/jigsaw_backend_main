import { Injectable } from '@nestjs/common';
import { GoogleAuthClient } from './google-auth.client';
import { RegisterDto } from 'src/auth/dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import { GoogleAuthToken } from './entities/google-auth-token.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@sentry/nestjs';
import {
  convertDateToStartOfDay,
  convertDateToEndOfDay,
} from 'src/_jigsaw/helpersFunc';
import { GoogleCalendarEventDto } from './dto/google-calendar-event.dto';
@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly googleAuthClient: GoogleAuthClient,
    private readonly userService: UsersService,

    @InjectRepository(GoogleAuthToken)
    private readonly googleAuthTokenRepository: Repository<GoogleAuthToken>,
  ) {}

  /**
   * Retrieves user meta information from a Google authentication token.
   *
   * @param token - The Google authentication token.
   * @returns A promise that resolves to a partial `RegisterDto` object containing the user's email and full name.
   */
  async getUserMetaInfo(token: string): Promise<Partial<RegisterDto>> {
    const { email, name } = await this.googleAuthClient.getUserMetaInfo(token);

    return { email, full_name: name };
  }

  /**
   * Retrieves the authentication URL for the Google OAuth2.0 authorization flow.
   *
   * @returns A promise that resolves to the authentication URL.
   */
  async getAuthenticationUrl(): Promise<{ url: string }> {
    const url = await this.googleAuthClient.getAuthenticationUrl();
    return { url };
  }

  /**
   * Processes the authorization code received from Google after user consent during the OAuth2.0 flow.
   *
   * @param code - The authorization code received from Google.
   * @returns A promise that resolves when the user's Google authentication tokens are successfully processed and stored.
   */
  async handleGoogleAuthCodeCallback(code: string): Promise<void> {
    // get the tokens
    const { tokens } = await this.googleAuthClient.getAuthTokens(code);
    const { id_token } = tokens;

    // // get user's email from the id_token
    const { email } = await this.googleAuthClient.getUserMetaInfo(id_token);

    // find the user
    const user = await this.userService.findUserByEmail(email);

    // if the user does not exist, return
    if (!user) {
      return;
    }

    // check if the user has a google auth token
    let googleAuthToken = await this.googleAuthTokenRepository.findOne({
      where: { user_id: { id: user.id } },
    });

    // if the user has a google auth token, return
    if (!googleAuthToken) {
      // update the google auth token
      googleAuthToken = await this.googleAuthTokenRepository.create({
        user_id: { id: user.id },
        tokens,
      });
      await this.googleAuthTokenRepository.save(googleAuthToken);
    }

    return;
  }

  /**
   * Checks if a Google authentication token exists for a given user.
   *
   * @param user_id - The ID of the user to check for the existence
   * @returns A promise that resolves to an object indicating whether the Google authentication token exists for the user.
   */
  async checkGoogleAuthTokenExists(
    user_id: number,
  ): Promise<{ exists: boolean }> {
    const googleAuthToken = await this.googleAuthTokenRepository.findOne({
      where: { user_id: { id: user_id } },
    });
    return { exists: !!googleAuthToken };
  }

  async getGoogleCalendarEventsOnDate(user: User, date: string): Promise<any> {
    const { timezone, id } = user;
    const googleAuthToken = await this.googleAuthTokenRepository.findOne({
      where: { user_id: { id: +id } },
    });

    const startOfDay = convertDateToStartOfDay(date, timezone);
    const endOfDay = convertDateToEndOfDay(date, timezone);

    if (!googleAuthToken) {
      return [];
    }

    const { tokens } = googleAuthToken;

    const eventItems =
      await this.googleAuthClient.getGoogleCalendarEventsOnDate(
        startOfDay,
        endOfDay,
        timezone,
        tokens,
      );
    //
    return eventItems;
  }

  /**
   * Creates Google Calendar events for multiple users.
   *
   * This method retrieves the Google authentication tokens for the specified user IDs
   * and creates a calendar event for each user using the provided event details.
   *
   * @param event - The details of the event to be created in Google Calendar.
   * @param userIds - An array of user IDs for whom the calendar events will be created.
   * @returns A promise that resolves when the events have been created for all users.
   */
  async createGoogleCalendarEvent(
    event: GoogleCalendarEventDto,
    userIds: number[],
  ): Promise<void> {
    const googleAuthTokens = await this.googleAuthTokenRepository.find({
      where: { user_id: { id: In(userIds) } },
    });

    if (!googleAuthTokens) {
      return;
    }

    for (const googleAuthToken of googleAuthTokens) {
      await this.googleAuthClient.createGoogleCalendarEvent(
        event,
        googleAuthToken.tokens,
      );
    }

    return;
  }
}
