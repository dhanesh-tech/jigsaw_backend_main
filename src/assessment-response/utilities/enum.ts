import { SKILL_DIFFICULTY_LEVEL } from 'src/assessment/utilities/enum';
import { QUESTION_DIFFICULTY_LEVELS } from 'src/master/utilities/enum';

export enum QUESTION_RESPONSE_STATUS {
  sent = 'sent',
  shown = 'shown',
  answered = 'answered',
  skipped = 'skipped',
}

// maximum times a user can skip or reload the questions
export const UNANSWERED_QUESTION_LIMIT: number = 5;

// mapping determines on which assessment skill difficulty
// the difficulty level of question to ask
export const SKILL_LEVEL_DIFFICULTY_MAPPING = {
  [SKILL_DIFFICULTY_LEVEL.beginner]: [
    QUESTION_DIFFICULTY_LEVELS.easy,
    QUESTION_DIFFICULTY_LEVELS.medium,
  ],
  [SKILL_DIFFICULTY_LEVEL.intermediate]: [
    QUESTION_DIFFICULTY_LEVELS.hard,
    QUESTION_DIFFICULTY_LEVELS.medium,
  ],
  [SKILL_DIFFICULTY_LEVEL.expert]: [QUESTION_DIFFICULTY_LEVELS.hard],
};
