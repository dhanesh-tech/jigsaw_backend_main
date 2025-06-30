import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarAvailability1729162968420 implements MigrationInterface {
  name = 'CalendarAvailability1729162968420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."calendar_availability_timezone_enum" AS ENUM('UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'America/Sao_Paulo')`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_availability" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "timezone" "public"."calendar_availability_timezone_enum" NOT NULL DEFAULT 'UTC', "hash_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "user_id" integer, CONSTRAINT "UQ_092cf6e222d1d2b3d6b51af5806" UNIQUE ("hash_id"), CONSTRAINT "PK_2a551bb51dec050bbb20ace880b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-availability-hash-id" ON "calendar_availability" ("hash_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-availability-user-id" ON "calendar_availability" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_availability" ADD CONSTRAINT "FK_1749b6a2b20cdff5e157a0cae23" FOREIGN KEY ("user_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_availability" DROP CONSTRAINT "FK_1749b6a2b20cdff5e157a0cae23"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-availability-user-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-availability-hash-id"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_availability"`);

    await queryRunner.query(
      `DROP TYPE "public"."calendar_availability_timezone_enum"`,
    );
  }
}
