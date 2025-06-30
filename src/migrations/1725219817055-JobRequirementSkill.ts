import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobRequirementSkill1725219817055 implements MigrationInterface {
  name = 'JobRequirementSkill1725219817055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "job_requirements_skill" ("id" SERIAL NOT NULL, "difficulty_level" "public"."skill_difficulty_level_enum" NOT NULL DEFAULT 'intermediate', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "jobrequirement_id" integer, "skill_id" integer, CONSTRAINT "UQ_aa6160f970be799dd92ed8de689" UNIQUE ("jobrequirement_id", "skill_id"), CONSTRAINT "PK_5a15fb13003f2b3200737532d47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_requirements_skill_skill_id" ON "job_requirements_skill" ("skill_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_requirements_skill_jobrequirement_id" ON "job_requirements_skill" ("jobrequirement_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements_skill" ADD CONSTRAINT "FK_3be397ced86bfdc4cce672249e9" FOREIGN KEY ("jobrequirement_id") REFERENCES "job_requirements"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements_skill" ADD CONSTRAINT "FK_79c9312fb7f95a0e75d005565de" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_requirements_skill" DROP CONSTRAINT "FK_79c9312fb7f95a0e75d005565de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requirements_skill" DROP CONSTRAINT "FK_3be397ced86bfdc4cce672249e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_requirements_skill_skill_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_requirements_skill_jobrequirement_id"`,
    );
    await queryRunner.query(`DROP TABLE "job_requirements_skill"`);
  }
}
