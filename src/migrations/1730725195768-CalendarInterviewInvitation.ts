import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarInterviewInvitation1730725195768
  implements MigrationInterface
{
  name = 'CalendarInterviewInvitation1730725195768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_interview_invitation" ("id" SERIAL NOT NULL, "email" character varying, "status" character varying NOT NULL, "hash_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "event_id" integer, "job_application_id" integer, "invitee_id" integer,"invited_by_id" integer, CONSTRAINT "UQ_7ebe44097b64304014744c6a1e1" UNIQUE ("hash_id"), CONSTRAINT "PK_ab712d9a56fbbe92f29b26dbabb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-interview-invitation-status" ON "calendar_interview_invitation" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-interview-invitation-hash-id" ON "calendar_interview_invitation" ("hash_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-interview-invitation-event-id" ON "calendar_interview_invitation" ("event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-interview-invitation-job-application-id" ON "calendar_interview_invitation" ("job_application_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-interview-invitation-invitee-id" ON "calendar_interview_invitation" ("invitee_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" ADD CONSTRAINT "FK_6f3feb06ec479dd580af8742f1a" FOREIGN KEY ("event_id") REFERENCES "calendar_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" ADD CONSTRAINT "FK_5b088e94e9fb7993cb08cdba276" FOREIGN KEY ("job_application_id") REFERENCES "job_application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" ADD CONSTRAINT "FK_75eeae30d59e23093395de416cc" FOREIGN KEY ("invitee_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" ADD CONSTRAINT "FK_75abece30d59e23993395fe416ac" FOREIGN KEY ("invited_by_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" DROP CONSTRAINT "FK_75eeae30d59e23093395de416cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" DROP CONSTRAINT "FK_5b088e94e9fb7993cb08cdba276"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" DROP CONSTRAINT "FK_75abece30d59e23993395fe416ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_interview_invitation" DROP CONSTRAINT "FK_6f3feb06ec479dd580af8742f1a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-interview-invitation-invitee-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-interview-invitation-job-application-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-interview-invitation-event-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-interview-invitation-hash-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-interview-invitation-status"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_interview_invitation"`);
  }
}
