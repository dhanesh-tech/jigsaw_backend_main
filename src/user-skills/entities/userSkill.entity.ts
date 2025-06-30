import { SKILL_DIFFICULTY_LEVEL } from 'src/assessment/utilities/enum';
import { Skill } from 'src/master/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/**
 * User Skill Entity
 *
 * This entity represents a user skill.
 *
 * - `id`: Unique identifier for the skill.
 * - `skill_id`: references to skills
 * - 'experience_level': taken from enum skill_difficulty_level
 * - 'self_rating_value': number out of 10
 * - 'evaluated_rating_value': number out of 10
 * - `updated`: Timestamp indicating when the skill record was last updated.
 * - `created`: Timestamp indicating when the skill record was created.
 */

@Entity({ name: 'user_skills' })
@Unique(['user_id', 'skill_id'])
export class UserSkills {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { nullable: true })
  evaluated_rating_value: number;

  @Column('decimal', { nullable: true })
  ai_rating_value: number;

  @Column()
  self_rating_value: number;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  @Index('idx-user-skills-skill-id')
  skill_id: Skill;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index('idx-user-skills-user-id')
  user_id: User;

  @Column({
    enum: SKILL_DIFFICULTY_LEVEL,
    type: 'enum',
    default: SKILL_DIFFICULTY_LEVEL.beginner,
  })
  @Index('idx-user-skills-experience-level')
  experience_level: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
