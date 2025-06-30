import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';
import { JobApplication } from 'src/job-application/entities/job-application.entity';
import { User } from 'src/users/entities/user.entity';
import { CalendarScheduledInterviewRating } from 'src/calendar-scheduled-event-rating/entities/calendar-scheduled-event-rating.entity';
import { AiInterviewAnalysis } from 'src/ai/entities/aiInterviewAnalysis.entity';

/**
 * Entity representing a scheduled event in the calendar.
 *
 * Columns:
 * - id: Primary key, auto-generated.
 * - start_time: The start time of the event (HH:mm format).
 * - end_time: The end time of the event (HH:mm format).
 * - is_enabled: A flag to indicate if the event is enabled.
 * - specific_date: The specific date of the event.
 * - hms_room_id: The ID of the HMS room associated with the event.
 * - event_id: Foreign key referencing the CalendarEvent entity.
 * - job_application_id: Foreign key referencing the JobApplication entity.
 * - organiser_id: Foreign key referencing the User, anyone can be organiser. Organiser is someone on whose availability interview is scheduled
 * - joinee_id: Foreign key referencing the User entity who is the joinee.
 * - created_at: Timestamp when the record was created.
 * - updated_at: Timestamp when the record was last updated.
 */
@Entity({ name: 'calendar_scheduled_interview' })
export class CalendarScheduledInterview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  start_time_in_utc: string;

  @Column({ type: 'timestamp' })
  end_time_in_utc: string;

  @Column({ type: 'date' })
  @Index('idx-calendar-scheduled-interview-interview-date')
  interview_date_in_utc: Date;

  @Column({ type: 'text' })
  hms_room_id: string;

  @Column({ type: 'boolean', default: true })
  @Index('idx-calendar-scheduled-interview-is-enabled')
  is_enabled: boolean;

  @ManyToOne(() => CalendarEvent, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn({ name: 'event_id' })
  @Index('idx-calendar-scheduled-interview-event-id')
  event_id: CalendarEvent;

  @ManyToOne(() => JobApplication, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn({ name: 'job_application_id' })
  @Index('idx-calendar-scheduled-interview-job-application-id')
  job_application_id: JobApplication;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'organiser_id' })
  @Index('idx-calendar-scheduled-interview-organiser-id')
  organiser_id: User;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'joinee_id' })
  @Index('idx-calendar-scheduled-interview-joinee-id')
  joinee_id: User;

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
    () => CalendarScheduledInterviewRating,
    (rating) => rating.scheduled_interview_id,
  )
  interview_ratings: CalendarScheduledInterviewRating[];

  @OneToMany(() => AiInterviewAnalysis, (analysis) => analysis.interview_id)
  ai_interview_analysis: AiInterviewAnalysis[];
}
