import { PartialType } from '@nestjs/mapped-types';

export class CreateAssessmentDto {
  status: string;
  title: string;
  total_questions: number;
  additional_notes: string;
  is_jigsaw_skill_assessment: boolean;
}

export class UpdateAssessmentDto extends PartialType(CreateAssessmentDto) {}
