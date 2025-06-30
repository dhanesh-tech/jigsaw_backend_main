import { PartialType } from '@nestjs/mapped-types';
import { Skill } from '../entities/skill.entity';
import { Topic } from '../entities/topic.entity';
import { IsOptional } from 'class-validator';

export class AutomatedQuestionBankDto {
  question_text: string;
  time_to_answer_in_minutes: number;
  difficulty_level: string;
  status: string;
  skill_id: Skill;

  @IsOptional()
  topic_id: Topic;

  @IsOptional()
  topic_list: any;
  @IsOptional()
  is_ai_generated: boolean;
}

export class UpdateAutomatedQuestionBankDto extends PartialType(
  AutomatedQuestionBankDto,
) {}
