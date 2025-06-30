import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentKitSkill1720786446051 implements MigrationInterface {
  name = 'AssessmentKitSkill1720786446051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "assessment_kit_skill" ("id" SERIAL NOT NULL, "difficulty_level" "public"."skill_difficulty_level_enum" NOT NULL DEFAULT 'intermediate', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "assessment_id" integer, "skill_id" integer, CONSTRAINT "uq_assessment_skill_assessment_id_skill_id" UNIQUE ("assessment_id", "skill_id"), CONSTRAINT "pk_assessment_kit_skill" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assesssment-kit-skill-difficulty-level" ON "assessment_kit_skill" ("difficulty_level") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assesssment-kit-skill-assessment-id" ON "assessment_kit_skill" ("assessment_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assesssment-kit-skill-skill-id" ON "assessment_kit_skill" ("skill_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_skill" ADD CONSTRAINT "fk_assessment_skill_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_skill" ADD CONSTRAINT "fk_assessment_skill_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_skill" DROP CONSTRAINT "fk_assessment_skill_skill_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_skill" DROP CONSTRAINT "fk_assessment_skill_assessment_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assesssment-kit-skill-skill-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assesssment-kit-skill-assessment-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assesssment-kit-skill-difficulty-level"`,
    );
    await queryRunner.query(`DROP TABLE "assessment_kit_skill"`);
  }
}
