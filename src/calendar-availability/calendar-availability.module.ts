import { Module } from '@nestjs/common';
import { CalendarAvailabilityService } from './calendar-availability.service';
import { CalendarAvailabilityController } from './calendar-availability.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarAvailability } from './entities/calendar-availabilty.entity';
import { CalendarAvailabilityTiming } from './entities/calendar-availability-timing.entity';
import { CalendarAvailabilityEvent } from './entities/calendar-availability-event.entity';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  providers: [CalendarAvailabilityService],
  controllers: [CalendarAvailabilityController],
  imports: [
    TypeOrmModule.forFeature([
      CalendarAvailability,
      CalendarAvailabilityTiming,
      CalendarAvailabilityEvent,
      CalendarEvent,
      User,
    ]),
  ],
})
export class CalendarAvailabilityModule {}
