import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentCandidateResponse1720799297444
  implements MigrationInterface
{
  name = 'AssessmentCandidateResponse1720799297444';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."assessment_candidate_question_response_status_enum" AS ENUM('sent', 'shown', 'answered', 'skipped')`,
    );
    await queryRunner.query(
      `CREATE TABLE "assessment_candidate_question_response" ("id" SERIAL NOT NULL, "status" "public"."assessment_candidate_question_response_status_enum" NOT NULL DEFAULT 'sent', "video_playback_id" character varying, "video_asset_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "assessment_id" integer, "candidate_id" integer, "question_id" integer, CONSTRAINT "uq_assessment_candidate_question_response_assessment_id_candidate_id_question_id" UNIQUE ("assessment_id", "candidate_id", "question_id"), CONSTRAINT "pk_assessment_candidate_question_response" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assessment-candidate-question-response-status" ON "assessment_candidate_question_response" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assessment-candidate-question-response-assessment-id" ON "assessment_candidate_question_response" ("assessment_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assessment-candidate-question-response-candidate-id" ON "assessment_candidate_question_response" ("candidate_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assessment-candidate-question-response-question-id" ON "assessment_candidate_question_response" ("question_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD CONSTRAINT "fk_assessment_candidate_question_response_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD CONSTRAINT "fk_assessment_candidate_question_response_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" ADD CONSTRAINT "fk_assessment_candidate_question_response_question_id" FOREIGN KEY ("question_id") REFERENCES "automated_question_bank"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP CONSTRAINT "fk_assessment_candidate_question_response_question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP CONSTRAINT "fk_assessment_candidate_question_response_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response" DROP CONSTRAINT "fk_assessment_candidate_question_response_assessment_id"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."idx-assessment-candidate-question-response-question-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assessment-candidate-question-response-candidate-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assessment-candidate-question-response-assessment-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assessment-candidate-question-response-status"`,
    );
    await queryRunner.query(
      `DROP TABLE "assessment_candidate_question_response"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."assessment_candidate_question_response_status_enum"`,
    );
  }
}
