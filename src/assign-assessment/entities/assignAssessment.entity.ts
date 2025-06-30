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
import { ASSESSMENT_ASSIGN_STATUS } from '../utilities/enum';
import { User } from 'src/users/entities/user.entity';
import { AssessmentKit } from 'src/assessment/entities/assessment.entity';

@Entity({ name: 'assigned_assessment_kit' })
@Unique(['candidate_id'])
export class AssignedAssessmentKit {
  /**
   * Represents an assigned assessment kit entity.
   *
   * @param id - The unique identifier for the assigned assessment kit.
   * @param remark_by_reviewee - Remarks provided by the reviewee regarding the assessment.
   * @param remark_by_assignee - Remarks provided by the assignee regarding the assessment.
   * @param status - The current status of the assigned assessment kit (e.g., assigned, completed).
   * @param assessment_id - The associated assessment kit for this assignment.
   * @param candidate_id - The candidate to whom the assessment kit is assigned.
   * @param assigned_by_id - The user who assigned the assessment kit.
   * @param reviewed_by_id - The user who reviewed the assessment kit.
   * @param created_at - The timestamp when the assignment was created.
   * @param updated_at - The timestamp when the assignment was last updated.
   */

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  remark_by_reviewee: string;

  @Column({ nullable: true })
  remark_by_assignee: string;

  @Column({
    enum: ASSESSMENT_ASSIGN_STATUS,
    type: 'enum',
    default: ASSESSMENT_ASSIGN_STATUS.assigned,
  })
  @Index('idx-assigned-assessment-kit-status')
  status: string;

  @ManyToOne(() => AssessmentKit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assessment_id' })
  @Index('idx-assigned-assessment-kit-assessment-id')
  assessment_id: AssessmentKit;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  @Index('idx-assigned-assessment-kit-candidate-id')
  candidate_id: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_by_id' })
  assigned_by_id: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  @Index('idx-assigned-assessment-kit-reviewed-by-id')
  reviewed_by_id: User;

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
