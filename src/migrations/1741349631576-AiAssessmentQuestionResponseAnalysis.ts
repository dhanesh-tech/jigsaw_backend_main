import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiAssessmentQuestionResponseAnalysis1741349631576
  implements MigrationInterface
{
  name = 'AiAssessmentQuestionResponseAnalysis1741349631576';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_assessment_question_response_analysis" ("id" SERIAL NOT NULL, "assessment_question_analysis" jsonb NOT NULL, "asset_id" character varying NOT NULL, "ai_model" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "assessment_response_id" integer, CONSTRAINT "PK_7f7551eb20425f0957735fca6ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-assessment-question-analysis-asset-id" ON "ai_assessment_question_response_analysis" ("asset_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-assessment-question-analysis-ai-model" ON "ai_assessment_question_response_analysis" ("ai_model") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-assessment-question-analysis-assessment-response-id" ON "ai_assessment_question_response_analysis" ("assessment_response_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_assessment_question_response_analysis" ADD CONSTRAINT "FK_840eb5972c6ba5fd66990dcf97b" FOREIGN KEY ("assessment_response_id") REFERENCES "assessment_candidate_question_response" ("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_assessment_question_response_analysis" DROP CONSTRAINT "FK_840eb5972c6ba5fd66990dcf97b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-assessment-question-analysis-assessment-response-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-assessment-question-analysis-ai-model"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-assessment-question-analysis-asset-id"`,
    );
    await queryRunner.query(
      `DROP TABLE "ai_assessment_question_response_analysis"`,
    );
  }
}
