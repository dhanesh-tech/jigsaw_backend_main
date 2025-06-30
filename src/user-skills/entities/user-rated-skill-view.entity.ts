import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'user_skill_rating_materialised_view',
  expression: `
  -- get all candidate's skill rating on the basis of assessment ratings

    WITH first_subselect AS (
    SELECT
        question_response.candidate_id,
        question.skill_id,
        question_response_rating.is_ai_generated,
        SUM(
            question_response_rating.rating_value
            * CASE question.difficulty_level
                WHEN 'easy'   THEN 0.3
                WHEN 'medium' THEN 0.5
                WHEN 'hard'   THEN 0.7
                ELSE 1
              END
        ) / SUM(
            CASE question.difficulty_level
                WHEN 'easy'   THEN 0.3
                WHEN 'medium' THEN 0.5
                WHEN 'hard'   THEN 0.7
                ELSE 1
            END
        ) AS weighted_average_rating
    FROM assessment_candidate_question_response_rating AS question_response_rating
    JOIN assessment_candidate_question_response AS question_response
        ON question_response_rating.assessment_candidate_question_response_id = question_response.id
    JOIN automated_question_bank AS question
        ON question_response.question_id = question.id
    GROUP BY
        question_response.candidate_id,
        question.skill_id,
        question_response_rating.is_ai_generated
    ),

-- select all ratings given by the mentors and HMs

    second_subselect AS (
      SELECT
        skill_rating.candidate_id,
        skill_rating.skill_id,
        skill_rating.is_ai_generated,
        AVG(skill_rating.rating_value) AS weighted_average_rating
      FROM candidate_skill_rating AS skill_rating
      GROUP BY
        skill_rating.candidate_id,
        skill_rating.skill_id,
        skill_rating.is_ai_generated
    )

    -- select only mentor's skill rating if mentor has rated the candidate's skill else 
    -- select skill rating given on assessment response
    SELECT
      COALESCE(second_subselect.candidate_id, first_subselect.candidate_id) AS candidate_id,
      COALESCE(second_subselect.skill_id, first_subselect.skill_id) AS skill_id,
      COALESCE(second_subselect.is_ai_generated, first_subselect.is_ai_generated) AS is_ai_generated,
      COALESCE(second_subselect.weighted_average_rating, first_subselect.weighted_average_rating) AS weighted_average_rating
    FROM first_subselect
    FULL OUTER JOIN second_subselect
      ON first_subselect.candidate_id = second_subselect.candidate_id
      AND first_subselect.skill_id = second_subselect.skill_id
      AND first_subselect.is_ai_generated = second_subselect.is_ai_generated;
    `,
  materialized: true,
})
export class UserRatedSkillView {
  @ViewColumn()
  candidate_id: number;

  @ViewColumn()
  skill_id: number;

  @ViewColumn()
  weighted_average_rating: number;

  @ViewColumn()
  is_ai_generated: boolean;
}
