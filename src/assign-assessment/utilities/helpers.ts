/**
 * Retrieves the assessment response for a specific candidate.
 *
 * @param candidate_id
 * @param skill_ids - as an array of skill ids
 * @returns A promise that resolves to a SQL query string
 *
 * query resolves to: { skill_id | question_status | answered_count }
 * will be used to get the candidate's assessment response
 */
export function getCandidateQuestionResponseCount(
  candidate_id: number,
  skill_ids: number[],
): string {
  return `SELECT
        question.skill_id,
        COUNT(*) AS answered_count
    FROM
        public.assessment_candidate_question_response response
    JOIN
        public.automated_question_bank question ON response.question_id = question.id
    WHERE
        response.candidate_id = ${candidate_id}
        AND response.status = 'answered'
        AND question.skill_id IN (${skill_ids.join(',')})
    GROUP BY
        question.skill_id;`;
}
