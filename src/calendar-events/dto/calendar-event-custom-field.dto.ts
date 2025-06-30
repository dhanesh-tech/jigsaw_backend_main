import { PartialType } from '@nestjs/mapped-types';

export class CalendarEventCustomFieldDto {
  question_text: string;
  is_required: boolean;
  calendar_event_id: number;
}

export class UpdateCalendarEventCustomFieldDto extends PartialType(
  CalendarEventCustomFieldDto,
) {}
