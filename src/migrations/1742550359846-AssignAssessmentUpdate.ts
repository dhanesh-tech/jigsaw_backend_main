import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignAssessmentUpdate1742550359846 implements MigrationInterface {
  name = 'AssignAssessmentUpdate1742550359846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "fk_assigned_assessment_kit_assessment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "uq_assigned_assessment_kit_assessment_id_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "UQ_4e8206286ae31179f87fb637829" UNIQUE ("candidate_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "FK_0b09bdddbcdce85305e10037081" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "FK_0b09bdddbcdce85305e10037081"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "UQ_4e8206286ae31179f87fb637829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "uq_assigned_assessment_kit_assessment_id_candidate_id" UNIQUE ("assessment_id", "candidate_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "fk_assigned_assessment_kit_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
