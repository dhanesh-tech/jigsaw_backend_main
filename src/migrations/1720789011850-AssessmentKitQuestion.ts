import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentKitQuestion1720789011850 implements MigrationInterface {
  name = 'AssessmentKitQuestion1720789011850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "assessment_kit_question" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "assessment_id" integer, "question_id" integer, CONSTRAINT "uq_assessment_kit_question_assessment_id_question_id" UNIQUE ("assessment_id", "question_id"), CONSTRAINT "pk_assessment_kit_question" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_question" ADD CONSTRAINT "fk_assessment_kit_question_skill_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_question" ADD CONSTRAINT "fk_assessment_kit_question_assessment_id" FOREIGN KEY ("question_id") REFERENCES "automated_question_bank"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_question" DROP CONSTRAINT "fk_assessment_kit_question_assessment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_kit_question" DROP CONSTRAINT "fk_assessment_kit_question_skill_id"`,
    );
    await queryRunner.query(`DROP TABLE "assessment_kit_question"`);
  }
}
