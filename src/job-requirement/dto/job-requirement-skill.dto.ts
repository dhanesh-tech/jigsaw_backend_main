import { SKILL_DIFFICULTY_LEVEL } from 'src/assessment/utilities/enum';
import { IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { JobRequirement } from '../entities/jobRequirement.entity';
import { Skill } from 'src/master/entities/skill.entity';

export class CreateJobRequirementSkillDto {
  jobrequirement_id: JobRequirement;
  skill_id: Skill;

  @IsEnum(SKILL_DIFFICULTY_LEVEL)
  difficulty_level: SKILL_DIFFICULTY_LEVEL;
}

export class UpdateJobRequirementSkillDto extends PartialType(CreateJobRequirementSkillDto) {}
