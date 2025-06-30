import { AssessmentKit } from '../entities/assessment.entity';
import { Skill } from 'src/master/entities/skill.entity';

export class CreateAssessmentSkillDto {
  difficulty_level: string;
  assessment_id: AssessmentKit;
  skill_id: Skill;
}

export class UpdateAssessmentSkillDto {
  difficulty_level: string;
}

export class SkillDifficultyLevelDto {
  difficulty_level: string;
  skill_id: number;
}
