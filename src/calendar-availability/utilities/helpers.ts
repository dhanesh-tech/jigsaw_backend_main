import moment, { Moment } from 'moment-timezone';
import { CalendarAvailabilityTiming } from '../entities/calendar-availability-timing.entity';
import { AdjustedSlotInterface } from '../dto/calendar-availability-timing.dto';

/**
 * Converts a given time string from a user's timezone to UTC.
 *
 * @param timeString - The time string in the format "HH:mm:ss".
 * @param userTimezone - The user's timezone identifier (e.g., "America/New_York").
 * @returns The converted time in UTC as an ISO string.
 * @throws Will throw an error if the time string format is invalid or if the date, time, or timezone is invalid.
 */
export function convertUserTimezoneToUtc(
  timeString: string,
  userTimezone: string,
): string {
  // Validate the input time string
  if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    throw new Error('Invalid time string format. Expected format: HH:mm:ss');
  }

  // Combine the current date with the time string in the user's timezone
  const currentDate = moment.tz(userTimezone).format('YYYY-MM-DD');
  const dateTimeString = `${currentDate}T${timeString}`; // e.g.: "2024-11-29T11:30:00"

  // Parse the combined string in the user's timezone
  const userDateTime = moment.tz(dateTimeString, userTimezone); //e.g. Moment<2024-11-29T11:30:00-05:00>

  if (!userDateTime.isValid()) {
    throw new Error('Invalid date, time, or timezone');
  }

  // Convert the user's datetime to UTC
  const utcDateTime = userDateTime.utc(); // e.g. Moment<2024-11-29T16:30:00Z>

  // Return the UTC datetime as an ISO string
  return utcDateTime.toISOString(); // e.g. "2024-11-29T16:30:00.000Z"
}

/**
 * Converts a given UTC date-time string to the user's specified timezone and formats it to 'HH:mm:ss'.
 *
 * @param utcDateTime - The UTC date-time string to be converted.
 * @param userTimezone - The timezone string representing the user's timezone.
 * @returns The formatted time string in 'HH:mm:ss' format according to the user's timezone.
 */
export function formatUtcToUserTimezone(
  utcDateTime: string,
  userTimezone: string,
): string {
  return moment.utc(utcDateTime).tz(userTimezone).format('HH:mm:ss');
}

/**
 * Retrieves available slots for a given date and user timezone.
 *
 * This function processes the provided availability timings to find slots that match
 * either a specific date or a recurring weekday. It then adjusts these slots to the user's
 * local timezone, handling any cross-midnight cases.
 *
 * @param queryDate - The date for which to find available slots, in 'DD-MM-YYYY' format.
 * @param userTimezone - The timezone of the user requesting the available slots.
 * @param availabilityTimings - An array of availability timings to check against.
 * @returns An array of adjusted slots in the user's local timezone.
 */
export function getAvailableSlots(
  queryDate: string,
  userTimezone: string,
  availabilityTimings: CalendarAvailabilityTiming[],
): AdjustedSlotInterface[] {
  // Parse the query date and determine the weekday
  const localQueryDate = moment
    .tz(queryDate, 'DD-MM-YYYY', userTimezone)
    .startOf('day');
  const queryWeekDay = localQueryDate.day(); // Numeric day of the week (0 = Sunday)

  // Step 1: Check for specific date matches
  const specificDateMatches = availabilityTimings.filter(
    (slot) =>
      slot.specific_date &&
      moment
        .tz(`${slot.specific_date}`, 'YYYY-MM-DD', userTimezone)
        .isSame(localQueryDate, 'day'),
  );

  // Step 2: Check for recurring weekday matches if no specific date matches
  const recurringWeekdayMatches = availabilityTimings.filter(
    (slot) => !slot.specific_date && slot.week_day === queryWeekDay,
  );

  // Combine the two sets of matches
  const matchedSlots = [...specificDateMatches, ...recurringWeekdayMatches];

  // Step 3: Convert matched slots to user's local timezone and handle cross-midnight cases
  const userTimezoneSlots = matchedSlots.flatMap((slot) =>
    adjustSlotForMidnight(slot, userTimezone, localQueryDate),
  );

  return userTimezoneSlots;
}

/**
 * Adjusts a calendar availability slot for cases where the slot crosses midnight.
 * If the slot does not cross midnight, it returns the slot as is.
 * If the slot crosses midnight, it splits the slot into two parts:
 * one for the time before midnight and one for the time after midnight.
 *
 * @param slot - The calendar availability slot to be adjusted.
 * @param userTimezone - The timezone of the user.
 * @param localQueryDate - The local date for which the slots are being queried.
 * @returns An array of adjusted slots that belong to the query date.
 */
function adjustSlotForMidnight(
  slot: CalendarAvailabilityTiming,
  userTimezone: string,
  localQueryDate: Moment,
): AdjustedSlotInterface[] {
  const slotStartLocal = moment.utc(slot.start_time).tz(userTimezone);
  const slotEndLocal = moment.utc(slot.end_time).tz(userTimezone);

  const adjustedSlots = [];

  // Case 1: Slot does not cross midnight
  if (slotStartLocal.isSame(slotEndLocal, 'day')) {
    adjustedSlots.push({
      id: slot.id,
      start_time: slotStartLocal.format('HH:mm:ss'),
      end_time: slotEndLocal.format('HH:mm:ss'),
      week_day: slot.week_day,
      specific_date: slot.specific_date,
    });
  } else {
    // Case 2: Slot crosses midnight, split into two parts
    // Part 1: Until the end of the first day
    adjustedSlots.push({
      id: slot.id,
      start_time: slotStartLocal.format('HH:mm:ss'),
      end_time: slotStartLocal.clone().endOf('day').format('HH:mm:ss'),
      week_day: slot.week_day,
      specific_date: slot.specific_date,
    });

    // Part 2: From the start of the next day
    adjustedSlots.push({
      id: slot.id,
      start_time: slotEndLocal.clone().startOf('day').format('HH:mm:ss'),
      end_time: slotEndLocal.format('HH:mm:ss'),
      week_day: slot.week_day,
      specific_date: slot.specific_date,
    });
  }

  // Return the adjusted slots that belong to the query date
  return adjustedSlots.filter((adjustedSlot) =>
    isSlotOnQueryDate(adjustedSlot, localQueryDate, userTimezone),
  );
}

/**
 * Determines if a given calendar slot falls on the specified query date.
 *
 * @param slot - The calendar availability timing object containing start and end times.
 * @param localQueryDate - The moment object representing the local query date.
 * @param userTimezone - The timezone of the user.
 * @returns A boolean indicating whether the slot is on the query date.
 */
function isSlotOnQueryDate(
  slot: CalendarAvailabilityTiming,
  localQueryDate: Moment,
  userTimezone: string,
): boolean {
  const slotStart = moment.tz(
    `${localQueryDate.format('YYYY-MM-DD')}T${slot.start_time}`,
    userTimezone,
  );
  const slotEnd = moment.tz(
    `${localQueryDate.format('YYYY-MM-DD')}T${slot.end_time}`,
    userTimezone,
  );

  return (
    slotStart.isSame(localQueryDate, 'day') ||
    slotEnd.isSame(localQueryDate, 'day')
  );
}
