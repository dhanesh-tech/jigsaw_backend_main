import { Skill } from 'src/master/entities/skill.entity';
import { AssessmentKit } from './assessment.entity';
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
import { SKILL_DIFFICULTY_LEVEL } from '../utilities/enum';

@Entity({ name: 'assessment_kit_skill' })
@Unique(['assessment_id', 'skill_id'])
export class AssessmentKitSkill {
  // id: number -> primary id
  // difficulty_level: string; -> skill difficulty level enum ['beginner','intermediate', 'expert',]
  // assessment_id: AssessmentKit; -> references to assessment_kit table
  // skill_id: Skill; -> references to Skills table
  // created_at: Date;
  // updated_at: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    enum: SKILL_DIFFICULTY_LEVEL,
    type: 'enum',
    default: SKILL_DIFFICULTY_LEVEL.intermediate,
  })
  @Index('idx-assesssment-kit-skill-difficulty-level')
  difficulty_level: string;

  @ManyToOne(() => AssessmentKit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  @Index('idx-assesssment-kit-skill-assessment-id')
  assessment_id: AssessmentKit;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  @Index('idx-assesssment-kit-skill-skill-id')
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
