import { Module } from '@nestjs/common';
import { CalendarScheduledEventRatingService } from './calendar-scheduled-event-rating.service';
import { CalendarScheduledEventRatingController } from './calendar-scheduled-event-rating.controller';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';
import { CalendarScheduledInterviewRating } from './entities/calendar-scheduled-event-rating.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [CalendarScheduledEventRatingService],
  controllers: [CalendarScheduledEventRatingController],
  imports: [
    TypeOrmModule.forFeature([
      CalendarScheduledInterview,
      CalendarScheduledInterviewRating,
    ]),
  ],
  exports: [CalendarScheduledEventRatingService],
})
export class CalendarScheduledEventRatingModule {}
