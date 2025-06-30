import { Logger, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { SendGridClient } from '../email/sendgrid-client';
import { AssessmentEventsListener } from './assessment-events-listener';
import { UsersModule } from '../users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { ReferralEventsListener } from './referral-events-listener';
import { JobEventsListener } from './job-email-invite-listener';
import { User } from 'src/users/entities/user.entity';
import { AuthEventsListener } from './auth-events-listener';
import { GoogleAuthModule } from 'src/google-auth/google-auth.module';
import { CalendarScheduledEventListener } from './calendar-scheduled-event-listener';
import { TranscriptionEventsListener } from './transcription-events-listener';
import { AwsModule } from 'src/aws/aws.module';
import { AiAgentsEventsListener } from './ai-agents-events-listener';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    UsersModule,
    GoogleAuthModule,
    AwsModule,
    TypeOrmModule.forFeature([AssignedAssessmentKit, User]),
  ],
  providers: [
    EmailService,
    SendGridClient,
    AssessmentEventsListener,
    Logger,
    ReferralEventsListener,
    JobEventsListener,
    AuthEventsListener,
    CalendarScheduledEventListener,
    TranscriptionEventsListener,
    AiAgentsEventsListener,
  ],
  exports: [EmailService],
})
export class EventsModule {}
