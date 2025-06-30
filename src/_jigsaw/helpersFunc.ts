import { instanceToPlain, plainToInstance } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import crypto from 'crypto';

/**
 * this function generates a unique uuid of defined length
 * returns alphanumeric string in this form a72bs23ece
 * @param length - the length of the string to return
 */

export function generateShortUniqueUUID(length: number) {
  const uniqueId = uuidv4();
  // take string of length
  return uniqueId.substring(0, length);
}

export function generateUniqueUUID() {
  const uniqueId = uuidv4();
  // take string of length
  return uniqueId;
}

/**
 * Generate hash key based on user email
 * @param email - The email to hash
 * @param length - The length of the hash code
 * @returns The generated hash code
 */
export function generateHashKeyOnEmail(email: string, length: number): string {
  const hash = crypto
    .createHash('sha256')
    .update(email, 'utf8')
    .digest('base64');
  // Remove characters not alphanumeric and then truncate
  const referralCode = hash.replace(/[^a-z0-9]/g, '').substring(0, length);
  return referralCode;
}

/**
 * checks if enum contains a value
 * @param value, enumObject
 */
export function enumContainsValue(value: string, enumObject: object): boolean {
  return Object.values(enumObject).includes(value);
}

/**
 * Serializes and deserializes a class instance.
 * @param instance - The class constructor to deserialize into.
 * @param data - The plain object to serialize and deserialize.
 * @returns The deserialized class instance.
 */
export function classSerialiser<T>(instance: new () => T, data: object): T {
  const transformedJobRequirement = instanceToPlain(data);
  const result = plainToInstance(instance, transformedJobRequirement);

  return result;
}

/**
 * Formats a date string to a locale time string with hour and minute.
 * @param dateStr - The date string to format.
 * @returns The formatted time string.
 *
 * e.g. formatTime('2021-08-12T12:00:00.000Z') => '12:00:00'
 */
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Converts a day of the week to a number (Sunday as 0, Monday as 1, ..., Saturday as 6).
 * @param day - The day of the week to convert.
 * @returns The corresponding number for the day of the week.
 */
export function dayOfWeekToNumber(day: string): number {
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return daysOfWeek.indexOf(day);
}

/**
 * Converts a time from one time zone to another.
 * @param time - The time string to convert (format: 'HH:mm:ss').
 * @param fromTimeZone - The source time zone.
 * @param toTimeZone - The target time zone.
 * @returns The converted time string in the target time zone.
 */
export function convertTimeZone(
  time: string,
  fromTimeZone: string,
  toTimeZone: string,
): string {
  // Parse the time in the source time zone
  const timeInSourceZone = moment.tz(time, 'HH:mm:ss', fromTimeZone);

  // Convert the time to the target time zone
  const timeInTargetZone = timeInSourceZone.clone().tz(toTimeZone);

  // Format the time in the target time zone to return the whole timestamp
  return timeInTargetZone.format();
}

/**
 * Converts a date and time from one time zone to another.
 * @param date - The date string to convert (format: 'YYYY-MM-DD').
 * @param time - The time string to convert (format: 'HH:mm').
 * @param fromTimeZone - The source time zone.
 * @param toTimeZone - The target time zone.
 * @returns The converted date and time string in the target time zone.
 */
export function convertDateTimeZone(
  date: string,
  time: string,
  fromTimeZone: string,
  toTimeZone: string,
): string {
  // Parse the date and time in the source time zone
  const dateTimeInSourceZone = moment.tz(
    `${date} ${time}`,
    'YYYY-MM-DD HH:mm',
    fromTimeZone,
  );

  if (!dateTimeInSourceZone.isValid()) {
    throw new Error('Invalid date or time format');
  }
  // Convert the date and time to the target time zone
  const dateTimeInTargetZone = dateTimeInSourceZone.clone().tz(toTimeZone);

  // Format the date and time in the target time zone
  return dateTimeInTargetZone.format();
}

/**
 * Generates a room name using two user IDs and the current timestamp.
 * @param userId1 - The first user ID.
 * @param userId2 - The second user ID.
 * @returns The generated room name.
 */
export function hmsRoomName(userId1: number, userId2: number): string {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  return `${userId1}-${userId2}-${timestamp}`;
}

/**
 * Generates a description string for a call between two users with the current timestamp.
 * @param userId1 - The first user ID.
 * @param userId2 - The second user ID.
 * @returns The generated description string with the current timestamp.
 */
export function hmsRoomDescription(userId1: number, userId2: number): string {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  return `Call between ${userId1} and ${userId2} create at ${timestamp}`;
}

/**
 * Returns the number of seconds from the current time to five minutes in the future.
 *
 * @returns {number} The number of seconds from now to five minutes from now.
 */
export function getSecondsFiveMinutesFromNow() {
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // Add 5 minutes in milliseconds
  const seconds = Math.floor(fiveMinutesFromNow.getTime()); // Convert to seconds
  return seconds;
}

/**
 * Extracts the domain name from a given URL.
 * @param url - The URL to extract the domain from.
 * @returns The extracted domain name or null if the URL is invalid.
 */

// todo -> discuss with team if we should use this function to split the domain
export function extractDomainFromUrl(url: string): string | null {
  const hostname = new URL(url).hostname;
  const parts = hostname.replace(/^www\./, '').split('.');
  const domain_url = parts.slice(-2).join('.');
  return domain_url.toLocaleLowerCase();
}

/**
 * Interceptor configuration for file uploads.
 * Limits file size to 25MB and allows only PDF and DOC files.
 */
// todo -> discuss with team if we should limit size to 25MB
export const resumeUploadInterceptor = {
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    if (!file.mimetype.match(/\/(pdf|doc|docx)$/)) {
      return callback(new Error('Only PDF and DOC files are allowed'), false);
    }
    callback(null, true);
  },
};

/**
 * Interceptor configuration for image uploads.
 * Limits file size to 25MB and allows only JPEG, PNG
 */
// todo -> use image magick or any other library
export const imageUploadInterceptor = {
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    if (!file.mimetype.match(/\/(jpeg|png)$/)) {
      return callback(
        new Error('Only JPEG, PNG, and GIF files are allowed'),
        false,
      );
    }
    callback(null, true);
  },
};

/**
 * Converts a date string to the start of the day in a specific timezone.
 * @param date - The date string to convert (format: 'YYYY-MM-DD').
 * @param timezone - The timezone to use for the conversion.
 * @returns The date string in the start of the day format.
 */
export function convertDateToStartOfDay(
  date: string,
  timezone: string,
): string {
  return moment.tz(date, 'DD-MM-YYYY', timezone).startOf('day').format();
}

/**
 * Converts a date string to the end of the day in a specific timezone.
 * @param date - The date string to convert (format: 'YYYY-MM-DD').
 * @param timezone - The timezone to use for the conversion.
 * @returns The date string in the end of the day format.
 */
export function convertDateToEndOfDay(date: string, timezone: string): string {
  return moment.tz(date, 'DD-MM-YYYY', timezone).endOf('day').format();
}
