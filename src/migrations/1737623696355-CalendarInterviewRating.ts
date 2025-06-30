import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarInterviewRating1737623696355
  implements MigrationInterface
{
  name = 'CalendarInterviewRating1737623696355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_scheduled_interview_rating" ("id" SERIAL NOT NULL, "interview_remarks" text NOT NULL, "overall_rating" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "rated_by_id" integer, "scheduled_interview_id" integer, CONSTRAINT "PK_e259fe5431e545dc15d94d40bf9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-rating-rated_by-id" ON "calendar_scheduled_interview_rating" ("rated_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-rating-interview-id" ON "calendar_scheduled_interview_rating" ("scheduled_interview_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview_rating" ADD CONSTRAINT "FK_d3f29c459b5a226108148f130fe" FOREIGN KEY ("rated_by_id") REFERENCES "users_customuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview_rating" ADD CONSTRAINT "FK_2c79d62034af4cfd9155d6566c0" FOREIGN KEY ("scheduled_interview_id") REFERENCES "calendar_scheduled_interview"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview_rating" DROP CONSTRAINT "FK_2c79d62034af4cfd9155d6566c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview_rating" DROP CONSTRAINT "FK_d3f29c459b5a226108148f130fe"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx-calendar-scheduled-interview-rating-interview-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-scheduled-interview-rating-rated_by-id"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_scheduled_interview_rating"`);
  }
}
