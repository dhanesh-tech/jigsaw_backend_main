import { Skill } from 'src/master/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';

export class CandidateSkillRatingDto {
  additional_comments?: string;
  rating_value: number;
  skill_id: Skill;
  candidate_id: User;
  rated_by_id: User;
}
