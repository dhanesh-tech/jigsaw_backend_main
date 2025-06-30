import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarScheduledInterview1730147280446
  implements MigrationInterface
{
  name = 'CalendarScheduledInterview1730147280446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_scheduled_interview" ("id" SERIAL NOT NULL, "start_time_in_utc" TIMESTAMP NOT NULL, "end_time_in_utc" TIMESTAMP NOT NULL, "interview_date_in_utc" date NOT NULL, "hms_room_id" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "event_id" integer, "job_application_id" integer, "organiser_id" integer, "joinee_id" integer, CONSTRAINT "PK_2aadf864749c51c0071e4ce7994" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-interview-date" ON "calendar_scheduled_interview" ("interview_date_in_utc") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-event-id" ON "calendar_scheduled_interview" ("event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-job-application-id" ON "calendar_scheduled_interview" ("job_application_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-organiser-id" ON "calendar_scheduled_interview" ("organiser_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-joinee-id" ON "calendar_scheduled_interview" ("joinee_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" ADD CONSTRAINT "FK_e25e3f25a624287b4fe5aab98c2" FOREIGN KEY ("event_id") REFERENCES "calendar_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" ADD CONSTRAINT "FK_9bd6aefb0a3665d0602dfeb852f" FOREIGN KEY ("job_application_id") REFERENCES "job_application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" ADD CONSTRAINT "FK_2fe0ca72a6a9e4df6eea6361f7b" FOREIGN KEY ("organiser_id") REFERENCES "users_customuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" ADD CONSTRAINT "FK_5fd78581c1b4b21efb83fdcb237" FOREIGN KEY ("joinee_id") REFERENCES "users_customuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" DROP CONSTRAINT "FK_5fd78581c1b4b21efb83fdcb237"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" DROP CONSTRAINT "FK_2fe0ca72a6a9e4df6eea6361f7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" DROP CONSTRAINT "FK_9bd6aefb0a3665d0602dfeb852f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" DROP CONSTRAINT "FK_e25e3f25a624287b4fe5aab98c2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-scheduled-interview-joinee-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-scheduled-interview-organiser-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-scheduled-interview-job-application-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-scheduled-interview-event-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-scheduled-interview-interview-date"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_scheduled_interview"`);
  }
}
