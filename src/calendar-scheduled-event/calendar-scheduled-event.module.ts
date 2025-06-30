import { Module } from '@nestjs/common';
import { CalendarScheduledInterviewController } from './calendar-scheduled-event.controller';
import { CalendarScheduledInterviewService } from './calendar-scheduled-event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarScheduledInterview } from './entities/calendar-scheduled-interview.entity';
import { CalendarAvailability } from 'src/calendar-availability/entities/calendar-availabilty.entity';
import { CalendarInterviewInvitation } from './entities/calandar-interview-invitation.entity';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';
import { AwsModule } from 'src/aws/aws.module';
import { HmsModule } from 'src/hms/hms.module';
import { UsersModule } from 'src/users/user.module';

@Module({
  controllers: [CalendarScheduledInterviewController],
  providers: [CalendarScheduledInterviewService],
  imports: [
    AwsModule,
    HmsModule,
    UsersModule,
    TypeOrmModule.forFeature([
      CalendarScheduledInterview,
      CalendarAvailability,
      CalendarInterviewInvitation,
      CalendarEvent,
    ]),
  ],
  exports: [CalendarScheduledInterviewService],
})
export class CalendarScheduledInterviewModule {}
