import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';
import { JobApplication } from 'src/job-application/entities/job-application.entity';
import { REFERRAL_INVITE_STATUS } from 'src/referral/utilities/enum';
import { User } from 'src/users/entities/user.entity';

export class CalendarInterviewInvitationDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(REFERRAL_INVITE_STATUS)
  @IsOptional()
  status: REFERRAL_INVITE_STATUS;

  event_id: CalendarEvent;

  @IsOptional()
  job_application_id?: JobApplication;

  @IsOptional()
  invitee_id?: User;
}
