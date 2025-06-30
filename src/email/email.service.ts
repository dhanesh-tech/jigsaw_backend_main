import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './sendgrid-client';
import { JIGSAW_INFO_EMAIL } from 'src/_jigsaw/envDefaults';
import { SendEmailDto, SendMultipleEmailsDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly sendGridClient: SendGridClient) {}

  // interacts with Sendgrid clies to send email
  // takes payload takes the payload as SendEmail dto defined in dto file
  // always returns success
  async sendSendgridEmail(sendEmailDTO: SendEmailDto): Promise<string> {
    const mail: MailDataRequired = {
      to: sendEmailDTO.recipient,
      from: JIGSAW_INFO_EMAIL,
      subject: sendEmailDTO.subject,
      content: [
        {
          type: 'text/html',
          value: sendEmailDTO.body,
        },
      ],
    };

    this.sendGridClient.send(mail);
    return `Success`;
  }

  // interacts with Sendgrid client to send email to multiple recipients
  // without sharing the email addresses with other recipients
  // takes payload takes the payload as SendEmail dto defined in dto file
  // always returns success
  async sendMultipleSendgridEmail(
    sendEmailDTO: SendMultipleEmailsDto,
  ): Promise<string> {
    if (!sendEmailDTO.recipients) {
      throw new Error('Recipients not provided in the payload');
    }
    const mail: MailDataRequired = {
      to: sendEmailDTO.recipients,
      from: JIGSAW_INFO_EMAIL,
      subject: sendEmailDTO.subject,
      content: [
        {
          type: 'text/html',
          value: sendEmailDTO.body,
        },
      ],
    };

    this.sendGridClient.sendMultiple(mail);
    return `Success`;
  }
}
