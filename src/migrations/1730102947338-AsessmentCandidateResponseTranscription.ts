import { MigrationInterface, QueryRunner } from 'typeorm';

export class AsessmentCandidateResponseTranscription1730102947338
  implements MigrationInterface
{
  name = 'AsessmentCandidateResponseTranscription1730102947338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD "candidate_response_transcription" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP COLUMN "candidate_response_transcription"`,
    );
  }
}
