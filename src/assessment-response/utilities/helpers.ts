import { QUESTION_STATUS } from 'src/master/utilities/enum';
import { SKILL_LEVEL_DIFFICULTY_MAPPING } from './enum';
/// find which skill to ask based on assigned and answered questions
export function getRandomQuestionQuery(
  total_questions: number,
  assessmentSkills: any[],
  answeredQuestions: any[],
  assignedQuestions: any[],
): string {
  let skillToAsk: any;

  // average of how many questions each skill should have
  const questionPerSkill: number = Math.floor(
    total_questions / assessmentSkills.length,
  );

  // if there are already assigned questions
  if (answeredQuestions.length) {
    /// calculate how many questions already asked for each skill
    assessmentSkills.forEach((sk) => {
      const questionsAskedBySkill = answeredQuestions.filter(
        (qn) => qn?.question_id?.skill_id?.id === sk?.skill_id?.id,
      );
      // if question per skill is greater than questions already asked by skill set it
      if (questionsAskedBySkill.length < questionPerSkill + 1) {
        skillToAsk = sk;
        return;
      }
    });
  }
  // if no assigned question skill is set to first assessment skill
  else {
    [skillToAsk] = assessmentSkills;
  }

  // here  we pick on random question difficulty level ('easy', 'medium','hard')
  // based on skill seniority level ('beginner', 'advanced', 'expert')
  const skillDifficultyMapping =
    SKILL_LEVEL_DIFFICULTY_MAPPING[skillToAsk.difficulty_level];

  const randomIndex = Math.floor(Math.random() * skillDifficultyMapping.length);

  const skillId: number = skillToAsk.skill_id.id;
  const difficulty_level: string = skillDifficultyMapping[randomIndex];

  const assignedQuestionIds: number[] = assignedQuestions.length
    ? assignedQuestions.map((item) => item.question_id.id)
    : [];

  // get random query string and return
  const query = selectRandomQuestionQuery(
    skillId,
    difficulty_level,
    assignedQuestionIds,
  );

  return query;
}

// query to pick one random question
export function selectRandomQuestionQuery(
  skill: number,
  difficulty_level: string,
  assignedQuestionIds: number[],
): string {
  // if already questions assigned pick one random question which are not in them
  if (assignedQuestionIds.length)
    return `select * from automated_question_bank where skill_id=${skill} AND difficulty_level='${difficulty_level}' AND status='${QUESTION_STATUS.moderated}' and id not in (${assignedQuestionIds.join(',')}) order by random() limit 1;`;
  else
    return `select * from automated_question_bank where skill_id=${skill} AND difficulty_level='${difficulty_level}' AND status='${QUESTION_STATUS.moderated}' order by random() limit 1;`;
}

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
export function getCandidateAllQuestionsResponseQuery(
  candidate_id: number,
  skill_ids: number[],
): string {
  return `SELECT
        question.skill_id as skill_id,
        question.id as question_id,
        response.status as status
    FROM
        public.assessment_candidate_question_response response
    JOIN
        public.automated_question_bank question ON response.question_id = question.id
    WHERE
        response.candidate_id = ${candidate_id}
        AND question.skill_id IN (${skill_ids.join(',')});`;
}

/**
 * Retrieves the per skill question response count.
 *
 * @param total_questions_count
 * @param skill_ids
 * @returns An array of objects with skill_id and count
 */
export function getPerSkillQuestionCount(
  total_questions_count: number,
  skill_ids: number[],
): { skill_id: number; count: number }[] {
  const baseCount = Math.floor(total_questions_count / skill_ids.length);
  const remainingQuestions = total_questions_count % skill_ids.length;

  return skill_ids.map((skill_id, index) => ({
    skill_id,
    count: baseCount + (index < remainingQuestions ? 1 : 0), // add 1 to the count if the index is less than the remaining questions
  }));
}

/**
 * Retrieves a random difficulty level for a question based on the skill level.
 *
 * @param skill_level - The skill level for which to retrieve a random difficulty level.
 * @returns A string representing the randomly selected difficulty level.
 */
export function getRandomQuestionDifficultyLevel(skill_level: string): string {
  const skillDifficultyMapping = SKILL_LEVEL_DIFFICULTY_MAPPING[skill_level];

  const randomIndex = Math.floor(Math.random() * skillDifficultyMapping.length);
  const difficulty_level: string = skillDifficultyMapping[randomIndex];

  return difficulty_level;
}
