import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarEventsCustomField1728857381611
  implements MigrationInterface
{
  name = 'CalendarEventsCustomField1728857381611';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_event_custom_field" ("id" SERIAL NOT NULL, "question_text" character varying NOT NULL, "is_required" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "calendar_event_id" integer, CONSTRAINT "PK_f2ce70b7e67db69c8b2b8dcfd7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-event-custom-field-event-id" ON "calendar_event_custom_field" ("calendar_event_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_custom_field" ADD CONSTRAINT "FK_6b0172070f972c3f7b0721cdc81" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_event_custom_field" DROP CONSTRAINT "FK_6b0172070f972c3f7b0721cdc81"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-event-custom-field-event-id"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_event_custom_field"`);
  }
}
