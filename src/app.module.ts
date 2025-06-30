import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  CacheModule,
  CacheInterceptor,
  CacheStore,
} from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import {
  SQL_DB_HOST,
  SQL_DB_NAME,
  SQL_DB_PASSWORD,
  SQL_DB_USER,
  SQL_DB_PORT,
  REDIS_PORT,
  REDIS_HOST,
  MONGODB_URI,
  MONGODB_DB_NAME,
} from './_jigsaw/envDefaults';
import { MasterModule } from './master/master.module';
import { AssignAssessmentModule } from './assign-assessment/assign-assessment.module';
import { AssessmentModule } from './assessment/assessment.module';
import { AssessmentResponseModule } from './assessment-response/assessment-response.module';
import { ReferralModule } from './referral/referral.module';
import { EventsModule } from './events/events.module';
import { JobRequirementModule } from './job-requirement/job-requirement.module';
import { UserSkillsModule } from './user-skills/user-skills.module';
import { SentryModule } from '@sentry/nestjs/setup';
// import { APP_FILTER } from '@nestjs/core';
import { JobApplicationModule } from './job-application/job-application.module';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';
import { CalendarAvailabilityModule } from './calendar-availability/calendar-availability.module';
import { CalendarScheduledInterviewModule } from './calendar-scheduled-event/calendar-scheduled-event.module';
import { HmsModule } from './hms/hms.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { MuxModule } from './mux/mux.module';
import { AwsModule } from './aws/aws.module';
import { UserMetaInfoSubscriber } from './users/subscriber/user-meta-info.subscriber';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createClient } from 'redis';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { CalendarScheduledEventRatingModule } from './calendar-scheduled-event-rating/calendar-scheduled-event-rating.module';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { PaymentModule } from './payment/payment.module';
import { MongooseModule } from '@nestjs/mongoose';

import { AiAgentsModule } from './ai-agents/ai-agents.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    SentryModule.forRoot(),

    // register the config module to load env
    ConfigModule.forRoot({
      envFilePath: '.env',
      // isGlobal: true,
    }),
    // register the typeorm module to connect to the database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: SQL_DB_HOST,
      port: SQL_DB_PORT,
      username: SQL_DB_USER,
      password: SQL_DB_PASSWORD,
      database: SQL_DB_NAME,
      autoLoadEntities: true,
      entities: [`dist/**/*.entity{ .ts,.js}`],
      migrations: ['dist/migrations/*.js'],
      synchronize: false,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: MONGODB_URI,
        dbName: MONGODB_DB_NAME,
      }),
    }),

    // register the cache module to use redis
    // CacheModule.registerAsync({
    //   useFactory: async () => {
    //     const client = createClient({
    //       socket: {
    //         host: REDIS_HOST,
    //         port: REDIS_PORT,
    //       },
    //     });

    //     await client
    //       .connect()
    //       .then(() => {
    //         console.log('Redis connected successfully');
    //       })
    //       .catch((err) => {
    //         throw new Error('Redis connection error -> ' + err);
    //       });

    //     return {
    //       store: client as unknown as CacheStore,
    //       ttl: 3 * 60000,
    //     };
    //   },
    //   isGlobal: true,
    // }),

    // register the schedule module for cron jobs
    ScheduleModule.forRoot(),

    EmailModule,
    UsersModule,
    AuthModule,
    MasterModule,
    AssessmentModule,
    AssignAssessmentModule,
    AssessmentResponseModule,
    EventsModule,
    JobRequirementModule,
    ReferralModule,
    UserSkillsModule,
    JobApplicationModule,
    CalendarEventsModule,
    CalendarAvailabilityModule,
    CalendarScheduledInterviewModule,
    HmsModule,
    WebhooksModule,
    MuxModule,
    AwsModule,
    GoogleAuthModule,
    CalendarScheduledEventRatingModule,
    CronModule,
    QuestionBankModule,
    ChatModule,
    AiModule,
    PaymentModule,
    AiAgentsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // register the logger
    Logger,

    // subscribe to the user entity to listen to events
    UserMetaInfoSubscriber,

    // register the cache interceptor to cache the response
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
})
export class AppModule {}
