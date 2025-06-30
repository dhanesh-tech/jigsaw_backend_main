import { IsEnum } from 'class-validator';
import { UserTimezoneConstants } from 'src/_jigsaw/enums';

/**
 * Data Transfer Object for specifying availability on a particular date.
 *
 * @property {string} title - The title for the availability.
 * @property {UserTimezoneConstants} timezone - The timezone for the specific date.
 */
export class CalendarAvailabilityDto {
  title: string;

  @IsEnum(UserTimezoneConstants)
  timezone: UserTimezoneConstants;
}
