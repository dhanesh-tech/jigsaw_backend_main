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
import { User } from 'src/users/entities/user.entity';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';

/**
 * Entity representing a scheduled interview rating in the calendar.
 *
 * Columns:
 * - id: Primary key, auto-generated.
 * - interview_remarks: Remarks given during the interview.
 * - overall_rating: Overall rating given during the interview.
 * - rated_by_id: Foreign key referencing the User entity who provided the rating.
 * - scheduled_interview_id: Foreign key referencing the CalendarScheduledInterview entity.
 * - created_at: Timestamp when the record was created.
 * - updated_at: Timestamp when the record was last updated.
 */
@Entity({ name: 'calendar_scheduled_interview_rating' })
export class CalendarScheduledInterviewRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  interview_remarks: string;

  @Column({ type: 'decimal', nullable: true })
  overall_rating: number;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'rated_by_id' })
  @Index('idx-calendar-scheduled-interview-rating-rated_by-id')
  rated_by_id: User;

  @ManyToOne(() => CalendarScheduledInterview, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'scheduled_interview_id' })
  @Index('idx-calendar-scheduled-interview-rating-interview-id')
  scheduled_interview_id: CalendarScheduledInterview;

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
