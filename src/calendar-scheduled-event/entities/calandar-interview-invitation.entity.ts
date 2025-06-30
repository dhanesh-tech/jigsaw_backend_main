import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { JobApplication } from 'src/job-application/entities/job-application.entity';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';
import { User } from 'src/users/entities/user.entity';
import { REFERRAL_INVITE_STATUS } from 'src/referral/utilities/enum';
import { generateShortUniqueUUID } from 'src/_jigsaw/helpersFunc';

@Entity({ name: 'calendar_interview_invitation' })
export class CalendarInterviewInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column()
  @Index('idx-calendar-interview-invitation-status')
  status: REFERRAL_INVITE_STATUS;

  @Column({ unique: true })
  @Index('idx-calendar-events-hash-id')
  hash_id: string;

  @ManyToOne(() => CalendarEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  @Index('idx-calendar-interview-invitation-event-id')
  event_id: CalendarEvent;

  @ManyToOne(() => JobApplication, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn({ name: 'job_application_id' })
  @Index('idx-calendar-interview-invitation-job-application-id')
  job_application_id: JobApplication;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'invitee_id' })
  @Index('idx-calendar-interview-invitation-invitee-id')
  invitee_id: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'invited_by_id' })
  @Index('idx-calendar-interview-invitation-invited-by-id')
  invited_by_id: User;

  @BeforeInsert()
  generateHashId() {
    this.hash_id = generateShortUniqueUUID(16);
  }

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
