export class GoogleCalendarEventDto {
  title: string;
  startTime: GoogleCalendarDateTimeDto;
  endTime: GoogleCalendarDateTimeDto;
  description: string;
  attendees: GoogleCalendarAttendeeDto[];
}

export class GoogleCalendarDateTimeDto {
  dateTime: string;
  timeZone: string;
}

export class GoogleCalendarAttendeeDto {
  email: string;
  displayName: string;
}
