import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobRequirement } from './jobRequirement.entity';
import { User } from 'src/users/entities/user.entity';

/**
 * Entity representing a recommended candidate for a job requirement.
 *
 * Columns:
 * @column id: Primary key, auto-generated.
 * @column jobrequirement_id: Foreign key to the JobRequirement entity, nullable, indexed.
 * @column candidate_id: Foreign key to the User entity, nullable.
 * @column score: Numeric score assigned to the candidate.
 * @column created_at: Timestamp of when the record was created, auto-generated.
 * @column updated_at: Timestamp of when the record was last updated, auto-generated.
 */
@Entity('jobrequirement_recommended_candidate')
export class JobRequirementRecommendedCandidate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobRequirement, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'jobrequirement_id' })
  @Index('idx-jobrequirement-recommended-candidate-jobrequirement-id')
  jobrequirement_id: JobRequirement;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate_id: User;

  @Column()
  score: number;

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
