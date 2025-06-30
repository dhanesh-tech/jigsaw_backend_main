import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobApplication1727469086397 implements MigrationInterface {
  name = 'JobApplication1727469086397';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."job_application_application_status_enum" AS ENUM('assessed', 'interview', 'hired', 'offered', 'rejected', 'shortlisted')`,
    );

    await queryRunner.query(
      `CREATE TABLE "job_application" ("id" SERIAL NOT NULL, "application_status" "public"."job_application_application_status_enum" NOT NULL DEFAULT 'assessed', "application_feedback" text, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "jobrequirement_id" integer, "candidate_id" integer, CONSTRAINT "UQ_6483f6e010418c86866d4e34dca" UNIQUE ("jobrequirement_id", "candidate_id"), CONSTRAINT "PK_c0b8f6b6341802967369b5d70f5" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(`
        CREATE INDEX "idx_job_application_jobrequirement_id" ON "job_application" ("jobrequirement_id");
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_job_application_candidate_id" ON "job_application" ("candidate_id");
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_job_application_application_status" ON "job_application" ("application_status");
    `);

    await queryRunner.query(
      `ALTER TABLE "job_application" ADD CONSTRAINT "FK_8aa3daeb28e00d9cfbeac03ed96" FOREIGN KEY ("jobrequirement_id") REFERENCES "job_requirements"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "job_application" ADD CONSTRAINT "FK_451f4e4120357dbd64a9a3aca8f" FOREIGN KEY ("candidate_id") REFERENCES "users_customuser"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_application" DROP CONSTRAINT "FK_451f4e4120357dbd64a9a3aca8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application" DROP CONSTRAINT "FK_8aa3daeb28e00d9cfbeac03ed96"`,
    );
    await queryRunner.query(`
            DROP INDEX "idx_job_application_jobrequirement_id";
        `);

    await queryRunner.query(`
            DROP INDEX "idx_job_application_candidate_id";
        `);

    await queryRunner.query(`
            DROP INDEX "idx_job_application_application_status";
        `);

    await queryRunner.query(`
            DROP TABLE "job_application";
        `);

    await queryRunner.query(
      `DROP TYPE "public"."job_application_application_status_enum"`,
    );
  }
}
