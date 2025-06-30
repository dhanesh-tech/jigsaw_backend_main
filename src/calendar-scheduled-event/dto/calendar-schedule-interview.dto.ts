import { IsOptional } from 'class-validator';

export class CalendarScheduleEventDto {
  start_time: string;
  end_time: string;
  interview_date: string;

  // Optional event ID
  @IsOptional()
  event_id: number;

  // Optional job application ID
  @IsOptional()
  job_application_id: number;

  // Optional timezone information
  @IsOptional()
  timezone: string;
}
