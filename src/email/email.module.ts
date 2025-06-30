import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { SendGridClient } from './sendgrid-client';

@Module({
  controllers: [EmailController],
  providers: [EmailService, SendGridClient],
})
export class EmailModule {}
