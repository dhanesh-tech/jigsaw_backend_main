import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { SendEmailDto } from '../email/dto/send-email.dto';
import * as fs from 'fs';
import * as path from 'path';
import {
  ERROR_HANDLING_EVENT,
  ERROR_TEMPLATE_NOT_FOUND,
  REFERRAL_USER_EMAIL_INVITE_EVENT,
  REFERRAL_USER_EMAIL_INVITE_SUBJECT,
} from 'src/_jigsaw/constants';
import { ReferralInvite } from 'src/referral/entities/referralInvites.entity';
import {
  JOB_INVITE_ACCEPT_URL,
  REFERRAL_INVITE_ACCEPT_URL,
} from 'src/_jigsaw/frontendUrlsConst';

@Injectable()
export class ReferralEventsListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  /**
   * Handles the event triggered when a user is invited via email
   * Sends the email to the user with referral_code and id.
   *
   * @param referralInvite - The whole referral invite object.
   */
  @OnEvent(REFERRAL_USER_EMAIL_INVITE_EVENT)
  async handleReferralEmailInviteEvent(
    referralInvite: ReferralInvite,
    job_id?: number,
  ) {
    try {
      const { referred_by_id, user_email, accepted_by_id } = referralInvite;

      // If referralinvite already contains accepted_by_id throw error
      if (accepted_by_id || !referred_by_id || !user_email) {
        throw new Error(
          `${ERROR_HANDLING_EVENT},
          ${REFERRAL_USER_EMAIL_INVITE_EVENT},
          ${referralInvite.id},`,
        );
      }

      // Path to the email template
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'referral-email-invite.html',
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

      let invite_link: string;
      if (job_id) {
        invite_link = JOB_INVITE_ACCEPT_URL(
          job_id,
          referred_by_id?.referral_code,
          referralInvite.referral_uuid,
        );
      } else {
        invite_link = REFERRAL_INVITE_ACCEPT_URL(
          referralInvite.referral_uuid,
          referred_by_id?.referral_code,
        );
      }

      // Replace placeholders in the template with dynamic values
      templateContent = templateContent
        .replace('{{referred_by_name}}', referred_by_id?.full_name)
        .replace('{{referred_by_name}}', referred_by_id?.full_name)
        .replace('{{invite_link}}', invite_link);

      // Prepare the email DTO with the recipient, subject, and body
      const emailDto: SendEmailDto = {
        recipient: user_email,
        subject: REFERRAL_USER_EMAIL_INVITE_SUBJECT,
        body: templateContent,
      };

      await this.emailService.sendSendgridEmail(emailDto);
    } catch (error) {
      throw new Error(
        `${ERROR_HANDLING_EVENT},
        ${REFERRAL_USER_EMAIL_INVITE_EVENT}`,
      );
    }
  }
}
