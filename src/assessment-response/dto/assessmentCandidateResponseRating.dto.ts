import { PartialType } from '@nestjs/mapped-types';
import { AssessmentCandidateResponse } from '../entities/assessmentCandidateResponse.entity';

export class CreateAssessmentCandidateResponseRatingDto {
  rating_value: number;
  comment: string;
  assessment_candidate_question_response_id: AssessmentCandidateResponse;
  is_ai_generated: boolean;
}

export class UpdateAssessmentCandidateResponseRatingDto extends PartialType(
  CreateAssessmentCandidateResponseRatingDto,
) {}
