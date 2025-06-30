import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentCandidateResponseRating1720800010668
  implements MigrationInterface
{
  name = 'AssessmentCandidateResponseRating1720800010668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "assessment_candidate_question_response_rating" ("id" SERIAL NOT NULL, "rating_value" integer NOT NULL, "comment" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "assessment_candidate_question_response_id" integer, "rated_by_id" integer, CONSTRAINT "uq_assessment_candidate_question_response_id_rated_by_id" UNIQUE ("assessment_candidate_question_response_id", "rated_by_id"), CONSTRAINT "pk_assessment_candidate_question_response_rating" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assessment-candidate-question-response-rating-assessment-candidate-question-response-id" ON "assessment_candidate_question_response_rating" ("assessment_candidate_question_response_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assessment-candidate-question-response-rating-rated-by-id" ON "assessment_candidate_question_response_rating" ("rated_by_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response_rating" ADD CONSTRAINT "assessment_candidate_question_response_rating_assessment_candidate_question_response_id" FOREIGN KEY ("assessment_candidate_question_response_id") REFERENCES "assessment_candidate_question_response"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response_rating" ADD CONSTRAINT "assessment_candidate_question_response_rating_rated_by_id" FOREIGN KEY ("rated_by_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response_rating" DROP CONSTRAINT "assessment_candidate_question_response_rating_rated_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_candidate_question_response_rating" DROP CONSTRAINT "assessment_candidate_question_response_rating_assessment_candidate_question_response_id"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."idx-assessment-candidate-question-response-rating-rated-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assessment-candidate-question-response-rating-assessment-candidate-question-response-id"`,
    );
    await queryRunner.query(
      `DROP TABLE "assessment_candidate_question_response_rating"`,
    );
  }
}
