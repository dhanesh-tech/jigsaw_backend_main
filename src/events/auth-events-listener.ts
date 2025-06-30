import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { SendEmailDto } from '../email/dto/send-email.dto';
import * as fs from 'fs';
import * as path from 'path';
import {
  ERROR_HANDLING_EVENT,
  ERROR_SENDING_EMAIL,
  ERROR_TEMPLATE_NOT_FOUND,
  MAX_COLLISION_HASH_ATTEMPT,
  NEW_USER_SIGNUP_REFERRAL_CODE_EVENT,
  USER_EMAIL_SIGNUP_EVENT,
  USER_EMAIL_SIGNUP_SUBJECT,
  USER_FORGOT_PASSWORD_EVENT,
  USER_PASSWORD_RESET_SUBJECT,
  USER_REFERRAL_CODE_LENGTH,
} from 'src/_jigsaw/constants';
import { UserEmailSignupDto } from './dto/auth-events.dto';
import {
  RESET_PASSWORD_URL,
  VERIFY_EMAIL_URL,
} from 'src/_jigsaw/frontendUrlsConst';
import { User } from 'src/users/entities/user.entity';
import {
  generateHashKeyOnEmail,
  generateShortUniqueUUID,
} from 'src/_jigsaw/helpersFunc';
import { UsersService } from 'src/users/users.service';

@Injectable()
/**
 * AuthEventsListener handles various authentication-related events.
 
 * @method handleUserSignupReferralCodeEvent
 * @async
 * @param {User} user - The user object containing user details.
 * @description Handles the event when a new user signs up with a referral code. Generates a unique referral code and hash ID for the user if they don't already have one.
 * 
 * @method handleUserEmailSignUpEvent
 * @async
 * @param {UserEmailSignupDto} emailSignupEventDto - Data transfer object containing user email signup details.
 * @description Handles the event when a user signs up via email. Sends a verification email to the user.
 * 
 * @method handleUserPasswordResetEvent
 * @async
 * @param {UserEmailSignupDto} passwordResetEventDto - Data transfer object containing user password reset details.
 * @description Handles the event when a user requests a password reset. Sends a password reset email to the user.
 */
export class AuthEventsListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
    private readonly logger: Logger,
  ) {}

  /**
   * @param {User} user - The user object containing user details.
   * @description Handles the event when a new user signs up with a referral code. Generates a unique referral code and hash ID for the user if they don't already have one.
   */
  @OnEvent(NEW_USER_SIGNUP_REFERRAL_CODE_EVENT)
  async handleUserSignupReferralCodeEvent(user: User) {
    try {
      let { referral_code, hash_id } = user;
      const email = user.email;

      // If the user already has a referral_code and hash_id, return
      if (referral_code && hash_id) {
        return;
      }

      // Generate a referral_code based on the user's email
      let referralCode = generateHashKeyOnEmail(
        email,
        USER_REFERRAL_CODE_LENGTH,
      );
      let counter = 1;

      // If the user already has a hash_id, use it; otherwise, generate a new one
      if (!hash_id) hash_id = generateShortUniqueUUID(20);

      // Attempt to generate a unique referral_code for the user
      while (counter <= MAX_COLLISION_HASH_ATTEMPT) {
        const userWithReferralCode =
          await this.userService.findUserByReferralCode(referralCode);
        if (!userWithReferralCode) {
          referralCode = generateHashKeyOnEmail(
            email + counter,
            USER_REFERRAL_CODE_LENGTH,
          );

          referral_code = referralCode;
          this.userService.updateUserReferralCode(user.id, {
            referral_code,
            hash_id,
          });
          return;
        }

        counter++;
      }

      throw new Error(
        `Cannot generate referral_code as counter exceeded, ${counter}: ${user.id}`,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @param {UserEmailSignupDto} emailSignupEventDto - Data transfer object containing user email signup details.
   * @description Handles the event when a user signs up via email. Sends a verification email to the user.
   */
  @OnEvent(USER_EMAIL_SIGNUP_EVENT)
  async handleUserEmailSignUpEvent(emailSignupEventDto: UserEmailSignupDto) {
    try {
      // Define the path to the email template
      const { user, email_token, password_reset_token } = emailSignupEventDto;
      const verification_link = VERIFY_EMAIL_URL(
        email_token,
        password_reset_token,
      );
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'verification-email.html',
      );
      let templateContent: string;
      try {
        // Check if the template file exists and read its content
        await fs.promises.access(templatePath); // This will throw an error if the file doesn't exist
        templateContent = await fs.promises.readFile(templatePath, 'utf8');
      } catch (error) {
        this.logger.error(`${ERROR_TEMPLATE_NOT_FOUND}: ${templatePath}`);
        return;
      }

      // Replace placeholders in the template with dynamic values
      templateContent = templateContent
        .replace('{{name}}', user.full_name)
        .replace('{{verification_link}}', verification_link);

      // Prepare the email DTO with the recipient, subject, and body
      const emailDto: SendEmailDto = {
        recipient: user.email,
        subject: USER_EMAIL_SIGNUP_SUBJECT,
        body: templateContent,
      };

      // Attempt to send the email using the EmailService
      try {
        await this.emailService.sendSendgridEmail(emailDto);
      } catch (error) {
        this.logger.error(`${ERROR_SENDING_EMAIL}: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`${ERROR_HANDLING_EVENT}: ${error.message}`);
    }
  }

  /**
   * @param {UserEmailSignupDto} passwordResetEventDto - Data transfer object containing user password reset details.
   * @description Handles the event when a user requests a password reset. Sends a password reset email to the user.
   */
  @OnEvent(USER_FORGOT_PASSWORD_EVENT)
  async handleUserPasswordResetEvent(
    passwordResetEventDto: UserEmailSignupDto,
  ) {
    try {
      const { user, password_reset_token } = passwordResetEventDto;
      const reset_link = RESET_PASSWORD_URL(password_reset_token);
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'forgot-password-email.html',
      );
      let templateContent: string;
      try {
        await fs.promises.access(templatePath);
        templateContent = await fs.promises.readFile(templatePath, 'utf8');
      } catch (error) {
        this.logger.error(`${ERROR_TEMPLATE_NOT_FOUND}: ${templatePath}`);
        return;
      }

      templateContent = templateContent.replace('{{reset_link}}', reset_link);

      const emailDto: SendEmailDto = {
        recipient: user.email,
        subject: USER_PASSWORD_RESET_SUBJECT,
        body: templateContent,
      };

      try {
        await this.emailService.sendSendgridEmail(emailDto);
      } catch (error) {
        this.logger.error(`${ERROR_SENDING_EMAIL}: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`${ERROR_HANDLING_EVENT}: ${error.message}`);
    }
  }
}
