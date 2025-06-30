import { PartialType } from '@nestjs/mapped-types';
import { Max } from 'class-validator';

export class CalendarEventDto {
  title: string;
  description: string;
  is_active: boolean;
  is_default: boolean;

  @Max(150, { message: 'Duration cannot be greater than 150 minutes' })
  duration_in_minutes: number;
}

export class UpdateCalendarEventDto extends PartialType(CalendarEventDto) {}
