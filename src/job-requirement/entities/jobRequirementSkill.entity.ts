import { Skill } from 'src/master/entities/skill.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { SKILL_DIFFICULTY_LEVEL } from 'src/assessment/utilities/enum';
import { JobRequirement } from './jobRequirement.entity';

@Entity({ name: 'job_requirements_skill' })
@Unique(['jobrequirement_id', 'skill_id'])
@Index('idx_job_requirements_skill_jobrequirement_id', ['jobrequirement_id'])
@Index('idx_job_requirements_skill_skill_id', ['skill_id'])
export class JobRequirementSkill {
  /**
   * Entity representing the relationship between a Job Requirement and Skills.
   * - `id`: Primary key of the entity.
   * - `difficulty_level`: Enum representing
   *  the skill difficulty level.
   * - `jobrequirement_id`: Foreign key referencing the `job_requirements` table.
   * - `skill_id`: Foreign key referencing the `skills` table.
   * - `created_at`: Timestamp of when the record was created.
   * - `updated_at`: Timestamp of when the record was last updated.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    enum: SKILL_DIFFICULTY_LEVEL,
    type: 'enum',
    default: SKILL_DIFFICULTY_LEVEL.intermediate,
  })
  difficulty_level: string;

  @ManyToOne(() => JobRequirement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobrequirement_id' })
  jobrequirement_id: JobRequirement;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill_id: Skill;

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
