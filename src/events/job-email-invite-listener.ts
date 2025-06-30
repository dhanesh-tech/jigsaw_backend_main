import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import {
  ValidEmailDto,
  SendMultipleEmailsDto,
} from '../email/dto/send-email.dto';
import * as fs from 'fs';
import * as path from 'path';
import {
  ERROR_HANDLING_EVENT,
  ERROR_TEMPLATE_NOT_FOUND,
  JOB_EMAIL_INVITE_TO_APPLY_EVENT,
  JOB_EMAIL_INVITE_TO_APPLY_SUBJECT,
} from 'src/_jigsaw/constants';
import { JOB_INVITE_ACCEPT_URL } from 'src/_jigsaw/frontendUrlsConst';
import { JobRequirement } from 'src/job-requirement/entities/jobRequirement.entity';

@Injectable()
export class JobEventsListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  /**
   * Handles the event triggered when a user is invited to a job via email
   * Sends the email to the user with job details and invite link.
   *
   * @param jobInvite - The whole job invite object.
   */
  @OnEvent(JOB_EMAIL_INVITE_TO_APPLY_EVENT)
  async handleJobEmailInviteEvent(
    jobRequirement: JobRequirement,
    candidateEmails: ValidEmailDto[],
  ) {
    try {
      const { title, id, posted_by_id } = jobRequirement;

      // If jobInvite already contains accepted_by_id throw error
      if (!id) {
        throw new Error(
          `${ERROR_HANDLING_EVENT},
                    ${JOB_EMAIL_INVITE_TO_APPLY_EVENT},
                    ${id},`,
        );
      }

      // Path to the email template
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'job-email-invite.html',
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

      const invite_link = JOB_INVITE_ACCEPT_URL(
        id,
        posted_by_id?.referral_code,
      );

      // Replace placeholders in the template with dynamic values
      templateContent = templateContent
        .replace('{{invited_by_name}}', posted_by_id?.full_name)
        .replace('{{job_title}}', title)
        .replace('{{invite_link}}', invite_link);

      const recipientEmails = candidateEmails.map(
        (recipient) => recipient.recipient,
      );

      // Prepare the email DTO with the recipient, subject, and body
      const emailDto: SendMultipleEmailsDto = {
        recipients: recipientEmails,
        subject: JOB_EMAIL_INVITE_TO_APPLY_SUBJECT(title),
        body: templateContent,
      };

      await this.emailService.sendMultipleSendgridEmail(emailDto);
    } catch (error) {
      throw new Error(
        `${ERROR_HANDLING_EVENT},
                ${JOB_EMAIL_INVITE_TO_APPLY_EVENT}`,
      );
    }
  }
}
