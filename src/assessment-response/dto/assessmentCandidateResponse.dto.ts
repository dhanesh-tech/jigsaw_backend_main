import { PartialType } from '@nestjs/mapped-types';

export class CreateAssessmentCandidateResponseDto {
  video_playback_id: string;
  video_asset_id: string;
  status: string;
}

export class UpdateAssessmentCandidateResponseDto extends PartialType(
  CreateAssessmentCandidateResponseDto,
) {}

export class NextSkillToAskDto {
  skill_id: number;
  remaining_count: number;
  assigned_question_ids: number[];
  difficulty_level: string;
}
