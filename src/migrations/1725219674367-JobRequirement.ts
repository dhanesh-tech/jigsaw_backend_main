import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobRequirement1725219674367 implements MigrationInterface {
  name = 'JobRequirement1725219674367';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."job_requirements_employment_type_enum" AS ENUM('full_time', 'part_time', 'contract', 'contract_to_hire')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_requirements_experience_enum" AS ENUM('0_to_3_years', '4_to_7_years', '8_to_10_years', '11_to_13_years', '14_to_17_years', '18_to_20_years', 'above_20_years')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_requirements_expertise_enum" AS ENUM('junior', 'mid', 'senior', 'lead')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_requirements_status_enum" AS ENUM('draft', 'publish', 'inactive', 'archive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_requirements_payment_type_enum" AS ENUM('annually', 'monthly', 'hourly')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_requirements_payment_currency_enum" AS ENUM('inr', 'usd', 'euro', 'aud', 'jpy', 'gbp', 'chf', 'cad', 'zar')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_requirements" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "is_remote" boolean NOT NULL DEFAULT false, "description" text, "employment_type" "public"."job_requirements_employment_type_enum", "experience" "public"."job_requirements_experience_enum", "expertise" "public"."job_requirements_expertise_enum", "status" "public"."job_requirements_status_enum", "payment_type" "public"."job_requirements_payment_type_enum", "payment_from" integer, "payment_to" integer, "payment_currency" "public"."job_requirements_payment_currency_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "country_id" integer, "state_id" integer, "city_id" integer, "company_industry_id" integer, "primary_role_id" integer, "posted_by_id" integer, CONSTRAINT "PK_9c77d4e7d897cd3e0c88717d574" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_requirements_status" ON "job_requirements" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_requirements_experience" ON "job_requirements" ("experience") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_requirements_employment_type" ON "job_requirements" ("employment_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_requirements_posted_by_id" ON "job_requirements" ("posted_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_requirements_title" ON "job_requirements" ("title") `,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" ADD CONSTRAINT "FK_7d589de7a6d53cde2bd70922fed" FOREIGN KEY ("country_id") REFERENCES "jobs_country"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" ADD CONSTRAINT "FK_069f73c859f83c0e315a89a6064" FOREIGN KEY ("state_id") REFERENCES "jobs_state"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" ADD CONSTRAINT "FK_4fc3162da2272166b75cb222fc3" FOREIGN KEY ("city_id") REFERENCES "jobs_city"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" ADD CONSTRAINT "FK_8c38a2c6fb83d08ef475c8b3e4c" FOREIGN KEY ("company_industry_id") REFERENCES "company_industries"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" ADD CONSTRAINT "FK_f6b6c47a50b621ecb2f9acb92d9" FOREIGN KEY ("primary_role_id") REFERENCES "job_primary_role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" ADD CONSTRAINT "FK_12bbf07c5781b81285997fa1e80" FOREIGN KEY ("posted_by_id") REFERENCES "users_customuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_requirements" DROP CONSTRAINT "FK_12bbf07c5781b81285997fa1e80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" DROP CONSTRAINT "FK_f6b6c47a50b621ecb2f9acb92d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" DROP CONSTRAINT "FK_8c38a2c6fb83d08ef475c8b3e4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" DROP CONSTRAINT "FK_4fc3162da2272166b75cb222fc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" DROP CONSTRAINT "FK_069f73c859f83c0e315a89a6064"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements" DROP CONSTRAINT "FK_7d589de7a6d53cde2bd70922fed"`,
    );

    await queryRunner.query(`DROP INDEX "public"."idx_job_requirements_title"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_requirements_posted_by_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_requirements_employment_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_requirements_experience"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_requirements_status"`,
    );
    await queryRunner.query(`DROP TABLE "job_requirements"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_requirements_payment_currency_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_requirements_payment_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_requirements_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_requirements_expertise_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_requirements_experience_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_requirements_employment_type_enum"`,
    );
  }
}
