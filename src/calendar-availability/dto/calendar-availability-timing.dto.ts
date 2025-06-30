import { IsInt, Min, Max, IsOptional, IsDateString } from 'class-validator';
import { UserTimezoneConstants } from 'src/_jigsaw/enums';

/**
 * Data Transfer Object for calendar availability timing.
 *
 * @property {string} start_time - The start time of the availability period.
 * @property {string} end_time - The end time of the availability period.
 * @property {number} [week_day] - The day of the week for the availability period (0-6, where 0 is Sunday and 6 is Saturday).
 * @property {Date} [specific_date] - A specific date for the availability period.
 */
export class CalendarAvailabilityTimingDto {
  start_time: string;

  end_time: string;

  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  week_day?: number;

  @IsDateString()
  @IsOptional()
  specific_date?: Date;
}

/**
 * Data Transfer Object for specifying availability on a particular date.
 *
 * @property {string} specific_date - The specific date for the availability.
 * @property {UserTimezoneConstants} [timezone] - The timezone for the specific date.
 */
export class DateSpecificAvailabilityDto {
  specific_date: string;

  @IsOptional()
  timezone?: UserTimezoneConstants;
}

/**
 * Interface representing an adjusted time slot.
 *
 * @property {string} start_time - The start time of the slot.
 * @property {string} end_time - The end time of the slot.
 * @property {number} id - The unique identifier of the slot.
 */
export interface AdjustedSlotInterface {
  start_time: string;
  end_time: string;
  id: number;
}
