import { JobRequirement } from 'src/job-requirement/entities/jobRequirement.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  OneToMany,
} from 'typeorm';
import { JOB_APPLICATION_STATUS } from '../utilities/enum';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';

/**
 * Entity representing a Job Application.
 * - `id`: Primary key of the job application.
 * - `job_id`: Foreign key referencing the related Job entity.
 * - `candidate_id`: Foreign key referencing the related Candidate entity.
 * - `application_status`: Enum or string representing the current status of the job application (applied, inactive, not_interested).
 * - `application_feedback`: Text representing candidate's application feedback
 * This entity stores the details of a candidate's application to a specific job, including their status and application progress.
 */

@Entity('job_application')
@Unique(['jobrequirement_id', 'candidate_id'])
@Index('idx_job_application_jobrequirement_id', ['jobrequirement_id'])
@Index('idx_job_application_candidate_id', ['candidate_id'])
@Index('idx_job_application_application_status', ['application_status'])
export class JobApplication {
  @PrimaryGeneratedColumn()
  id: number;

  // to do ->  add option of inactive job application when user/ job requirement is deleted
  @ManyToOne(() => JobRequirement, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'jobrequirement_id' })
  jobrequirement_id: JobRequirement;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'candidate_id' })
  candidate_id: User;

  @Column({
    type: 'enum',
    enum: JOB_APPLICATION_STATUS,
    default: JOB_APPLICATION_STATUS.assessed,
  })
  application_status: JOB_APPLICATION_STATUS;

  @Column({ type: 'text', nullable: true })
  application_feedback: string;

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

  @OneToMany(
    () => CalendarScheduledInterview,
    (scheduled_interview) => scheduled_interview.job_application_id,
  )
  scheduled_interviews: CalendarScheduledInterview[];
}
