import { IsEnum } from 'class-validator';
import { QuestionFlagStatus } from '../utilities/enums';

/**
 * Data Transfer Object for flagging a question in the question bank.
 *
 * @param status - The status of the question flag.
 * @param flag_description - The description of the flag.
 * @param question_id - The ID of the question to flag.
 */
export class FlagQuestionBankDto {
  @IsEnum(QuestionFlagStatus)
  status: QuestionFlagStatus;

  flag_description?: string;
  question_id: number;
}
