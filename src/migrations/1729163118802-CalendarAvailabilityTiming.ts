import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarAvailabilityTiming1729163118802
  implements MigrationInterface
{
  name = 'CalendarAvailabilityTiming1729163118802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_availability_timing" ("id" SERIAL NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "week_day" integer, "specific_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "availability_id" integer, CONSTRAINT "PK_1a9a465cbc394365a65df7580d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-availability-timing-availability-id" ON "calendar_availability_timing" ("availability_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-availability-timing-week-day" ON "calendar_availability_timing" ("week_day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-availability-timing-specific-date" ON "calendar_availability_timing" ("specific_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_availability_timing" ADD CONSTRAINT "FK_34f3d8e7ac82e1c4980a52d0fbf" FOREIGN KEY ("availability_id") REFERENCES "calendar_availability"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_availability_timing" DROP CONSTRAINT "FK_34f3d8e7ac82e1c4980a52d0fbf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-availability-timing-availability-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-availability-timing-week-day"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-availability-timing-specific-date"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_availability_timing"`);
  }
}
