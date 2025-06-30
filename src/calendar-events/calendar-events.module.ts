import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventsController } from './calendar-events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { CalendarEventCustomField } from './entities/calendar-event-custom-question.entity';
import { CalendarAvailabilityEvent } from 'src/calendar-availability/entities/calendar-availability-event.entity';

@Module({
  providers: [CalendarEventsService],
  controllers: [CalendarEventsController],
  imports: [
    TypeOrmModule.forFeature([
      CalendarEvent,
      CalendarEventCustomField,
      CalendarAvailabilityEvent,
    ]),
  ],
})
export class CalendarEventsModule {}
