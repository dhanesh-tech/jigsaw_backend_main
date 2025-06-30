import { MigrationInterface, QueryRunner } from 'typeorm';

export class SkillRatingView1731071904131 implements MigrationInterface {
  name = 'SkillRatingView1731071904131';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE MATERIALIZED VIEW "user_skill_rating_materialised_view" AS 
      SELECT
  question_response.candidate_id,
  question.skill_id,
  question_response_rating.is_ai_generated,

  SUM(question_response_rating.rating_value * CASE question.difficulty_level
      WHEN 'easy' THEN 0.3
      WHEN 'medium' THEN 0.5
      WHEN 'hard' THEN 0.7
      ELSE 1 END
  )  / SUM(CASE question.difficulty_level
      WHEN 'easy' THEN 0.3
      WHEN 'medium' THEN 0.5
      WHEN 'hard' THEN 0.7
      ELSE 1 END
  ) AS weighted_average_rating
FROM
  assessment_candidate_question_response_rating question_response_rating
JOIN
  assessment_candidate_question_response question_response
  ON question_response_rating.assessment_candidate_question_response_id = question_response.id
JOIN
  automated_question_bank question
  ON question_response.question_id = question.id
GROUP BY
  question_response.candidate_id,
  question.skill_id,
  question_response_rating.is_ai_generated
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'MATERIALIZED_VIEW',
        'user_skill_rating_materialised_view',
        "SELECT\n    question_response.candidate_id,\n    question.skill_id,\n    question_response_rating.is_ai_generated,\n    SUM(question_response_rating.rating_value * CASE question.difficulty_level\n        WHEN 'easy' THEN 0.3\n        WHEN 'medium' THEN 0.5\n        WHEN 'hard' THEN 0.7\n        ELSE 1 END\n    )  / SUM(CASE question.difficulty_level\n        WHEN 'easy' THEN 0.3\n        WHEN 'medium' THEN 0.5\n        WHEN 'hard' THEN 0.7\n        ELSE 1 END\n    ) AS weighted_average_rating\nFROM\n    assessment_candidate_question_response_rating question_response_rating\nJOIN\n    assessment_candidate_question_response question_response\n    ON question_response_rating.assessment_candidate_question_response_id = question_response.id\nJOIN\n    automated_question_bank question\n    ON question_response.question_id = question.id\nGROUP BY\n    question_response.candidate_id,\n    question.skill_id,\n    question_response_rating.is_ai_generated",
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'user_skill_rating_materialised_view', 'public'],
    );
    await queryRunner.query(
      `DROP MATERIALIZED VIEW "user_skill_rating_materialised_view"`,
    );
  }
}
