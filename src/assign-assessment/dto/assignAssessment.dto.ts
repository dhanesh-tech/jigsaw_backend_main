import { AssessmentKit } from 'src/assessment/entities/assessment.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateAssignedAssessmentDto {
  assessment_id: AssessmentKit;
  candidate_id: User;
}

export class UpdateAssignedAssessmentDto {
  status: string;
  remark_by_reviewee: string;
  remark_by_assignee: string;
}

export class ProfileAssessmentDto {
  status: string;
  title: string;
  total_questions: number;
  answered_questions: number;
}
