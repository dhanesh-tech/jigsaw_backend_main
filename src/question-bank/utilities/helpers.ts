import { FLAGGED_QUESTION_THRESHOLD } from 'src/_jigsaw/constants';
import { APPROVED_QUESTION_THRESHOLD } from 'src/_jigsaw/constants';
import { QUESTION_RESPONSE_STATUS } from 'src/assessment-response/utilities/enum';

export const getArchiveFlaggedQuestionsQuery = (): string => {
  return `
    SELECT 
    question_id,
    SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) as flag_count,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count
FROM 
    automated_question_bank_flag
GROUP BY 
    question_id
HAVING 
    SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) > ${FLAGGED_QUESTION_THRESHOLD}
    OR
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) > ${APPROVED_QUESTION_THRESHOLD};`;
};

export const updateQuestionStatusQuery = (
  questionIds: number[],
  status: string,
): string => {
  return `
  UPDATE automated_question_bank
  SET 
    status = '${status}',
    updated_at = CURRENT_TIMESTAMP(6)
  WHERE id IN (${questionIds.join(',')});
  `;
};

export const removeFlaggedQuestionsFromCandidateResponseQuery = (
  questionIds: number[],
): string => {
  return `DELETE FROM assessment_candidate_response WHERE question_id IN (${questionIds.join(',')}) and status IN ('${QUESTION_RESPONSE_STATUS.sent}', '${QUESTION_RESPONSE_STATUS.shown}, '${QUESTION_RESPONSE_STATUS.skipped}');`;
};
