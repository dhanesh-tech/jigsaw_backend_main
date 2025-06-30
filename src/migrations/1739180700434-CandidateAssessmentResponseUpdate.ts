import { MigrationInterface, QueryRunner } from 'typeorm';

export class CandidateAssessmentResponseUpdate1739180700434
  implements MigrationInterface
{
  name = 'CandidateAssessmentResponseUpdate1739180700434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP CONSTRAINT "fk_assessment_candidate_question_response_assessment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP CONSTRAINT "uq_assessment_candidate_question_response_assessment_id_candida"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD CONSTRAINT "UQ_7fb4a2688e1006fa3f7d7391e1b" UNIQUE ("candidate_id", "question_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD CONSTRAINT "FK_7aad75ff912a0b5b3745f2a66e6" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP CONSTRAINT "FK_7aad75ff912a0b5b3745f2a66e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP CONSTRAINT "UQ_7fb4a2688e1006fa3f7d7391e1b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD CONSTRAINT "uq_assessment_candidate_question_response_assessment_id_candida" UNIQUE ("assessment_id", "candidate_id", "question_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD CONSTRAINT "fk_assessment_candidate_question_response_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
