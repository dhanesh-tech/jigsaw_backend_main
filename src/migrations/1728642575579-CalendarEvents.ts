import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarEvents1728642575579 implements MigrationInterface {
  name = 'CalendarEvents1728642575579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_event" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "duration_in_minutes" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "is_default" boolean NOT NULL DEFAULT false, "hash_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "organiser_id" integer, CONSTRAINT "UQ_e39084f6ab4546394dab313ef9f" UNIQUE ("hash_id"), CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx-calendar-event-hash-id" ON "calendar_event" ("hash_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-event-organiser-id" ON "calendar_event" ("organiser_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event" ADD CONSTRAINT "FK_a888a378a3022c04c5a47771d07" FOREIGN KEY ("organiser_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_event" DROP CONSTRAINT "FK_a888a378a3022c04c5a47771d07"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-event-organiser-id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx-calendar-event-hash-id"`);
    await queryRunner.query(`DROP TABLE "calendar_event"`);
  }
}
