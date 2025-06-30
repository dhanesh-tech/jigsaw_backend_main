import { Injectable, Logger } from '@nestjs/common';
import { MailDataRequired, default as SendGrid } from '@sendgrid/mail';
import { SENDGRID_API_KEY } from 'src/_jigsaw/envDefaults';

@Injectable()
export class SendGridClient {
  private logger: Logger;
  constructor() {
    this.logger = new Logger(SendGridClient.name);
    SendGrid.setApiKey(SENDGRID_API_KEY);
  }

  /**
   *
   * @param mail
   * @throws error and log to sentry
   */
  async send(mail: MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(mail);
      this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
    } catch (error) {
      // log error to sentry with mail and error object
      throw new Error(`${error}, ${mail}`);
    }
  }

  /**
   *
   * @param mail
   * @throws error and log to sentry
   */
  async sendMultiple(mail: MailDataRequired): Promise<void> {
    try {
      await SendGrid.sendMultiple(mail);
      this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
    } catch (error) {
      // log error to sentry with mail and error object
      throw new Error(`${error}, ${mail}`);
    }
  }
}
