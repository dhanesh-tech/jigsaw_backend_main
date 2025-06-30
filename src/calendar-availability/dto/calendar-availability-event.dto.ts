/**
 * Data Transfer Object for calendar availability events.
 *
 * @property {number} event_id - The unique identifier for the event.
 * @property {number} availability_id - The unique identifier for the availability.
 */
export class CalendarAvailabilityEventDto {
  event_id: number;
  availability_id: number;
}
