import { IsOptional } from 'class-validator';

/**
 * Data Transfer Object for Calendar Schedule Interview Rating.
 * @field scheduled_interview_id: number
 * @field overall_rating: number (optional)
 * @field interview_remarks: string
 */
export class CalendarScheduleEventRatingDto {
  scheduled_interview_id: number;

  @IsOptional()
  overall_rating: number;

  interview_remarks: string;
}
