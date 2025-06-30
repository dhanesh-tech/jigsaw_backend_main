import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { Skill } from 'src/master/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';
import { SKILL_DIFFICULTY_LEVEL } from 'src/assessment/utilities/enum';

/**
 * self_rating_value - rating which user gives himself
 * experience_level - beginner, intermediate, advanced
 * skill_id - refers to skills table
 * user_id - loggedin user
 */
export class CreateUserSkillDto {
  self_rating_value: number;
  skill_id: Skill;
  user_id: User;
  @IsEnum(SKILL_DIFFICULTY_LEVEL)
  experience_level: SKILL_DIFFICULTY_LEVEL;
}

export class UpdateUserSkillDto extends PartialType(CreateUserSkillDto) {}
