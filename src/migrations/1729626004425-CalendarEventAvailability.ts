import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarEventAvailability1729626004425
  implements MigrationInterface
{
  name = 'CalendarEventAvailability1729626004425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_availability_event" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "availability_id" integer, "event_id" integer, CONSTRAINT "PK_f3e011b1e4592bd887f670f9fd4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-availability-event-availability-id" ON "calendar_availability_event" ("availability_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-availability-event-event-id" ON "calendar_availability_event" ("event_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_availability_event" ADD CONSTRAINT "FK_a5863cd3446280a02dbc87163e8" FOREIGN KEY ("availability_id") REFERENCES "calendar_availability"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_availability_event" ADD CONSTRAINT "FK_34624c4e70f131b3164a0615a0c" FOREIGN KEY ("event_id") REFERENCES "calendar_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_availability_event" DROP CONSTRAINT "FK_a5863cd3446280a02dbc87163e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_availability_event" DROP CONSTRAINT "FK_34624c4e70f131b3164a0615a0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx-calendar-availability-event-availability-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx-calendar-availability-event-event-id"  `,
    );
    await queryRunner.query(`DROP TABLE "calendar_availability_event"`);
  }
}
