import { IsEmail } from 'class-validator';

export class ValidEmailDto {
  @IsEmail()
  recipient: string;
}

export class SendEmailDto {
  recipient: string;
  body: string; /// html string
  subject: string;
}

export class SendMultipleEmailsDto {
  body: string; /// html string
  subject: string;
  recipients: string[];
}
