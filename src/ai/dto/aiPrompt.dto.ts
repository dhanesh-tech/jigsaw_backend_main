import { IsEnum, IsString } from 'class-validator';
import { AI_PROMPT_TYPE, AI_MODEL } from '../utilities/enum';

export class AiPromptDto {
  @IsEnum(AI_PROMPT_TYPE)
  prompt_type: AI_PROMPT_TYPE;

  @IsEnum(AI_MODEL)
  ai_model: AI_MODEL;

  @IsString()
  prompt_text: string;
}
