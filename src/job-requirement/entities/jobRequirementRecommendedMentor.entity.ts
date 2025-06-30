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
 * Represents a recommended mentor for a job requirement.
 *
 * @column id - The primary key for the entity.
 * @column jobrequirement_id - The associated job requirement.
 * @column mentor_id - The recommended mentor.
 * @column score - The score assigned to the mentor recommendation.
 * @column created_at - The timestamp when the entity was created.
 * @column updated_at - The timestamp when the entity was last updated.
 */
@Entity('jobrequirement_recommended_mentor')
export class JobRequirementRecommendedMentor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobRequirement, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'jobrequirement_id' })
  @Index('idx-jobrequirement-recommended-mentor-jobrequirement-id')
  jobrequirement_id: JobRequirement;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'mentor_id' })
  mentor_id: User;

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
