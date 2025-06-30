import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentCandidateResponseRatingUpdate1730804829216
  implements MigrationInterface
{
  name = 'AssessmentCandidateResponseRatingUpdate1730804829216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response_rating" ADD "is_ai_generated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assessment-candidate-question-response-rating-ai-generated" ON "assessment_candidate_question_response_rating" ("is_ai_generated") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "idx-assessment-candidate-question-response-rating-ai-generated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response_rating" DROP COLUMN "is_ai_generated"`,
    );
  }
}
