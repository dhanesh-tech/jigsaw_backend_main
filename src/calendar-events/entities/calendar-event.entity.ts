import { Max } from 'class-validator';
import { generateShortUniqueUUID } from 'src/_jigsaw/helpersFunc';
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
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { CalendarEventCustomField } from './calendar-event-custom-question.entity';

/**
 * The CalendarEvent entity represents an event in the calendar.
 *
 * Columns:
 * - id: Primary key for the calendar event.
 * - title: Title of the event.
 * - description: Description of the event.
 * - is_active: Flag to indicate if the event is active.
 * - is_default: Flag to indicate if the event is a default event.
 * - duration_in_minutes: Duration of the event in minutes (maximum 150 minutes).
 * - hash_id: Unique hash ID for the event.
 * - organiser_id: Reference to the user who is the organizer of the event.
 * - created_at: Timestamp when the event was created.
 * - updated_at: Timestamp when the event was last updated.
 */
@Entity({ name: 'calendar_event' })
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  // once increased it should not be descresed
  @Column()
  @Max(150) // Maximum duration of 150 minutes
  duration_in_minutes: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_default: boolean;

  @Column({ unique: true })
  @Index('idx-calendar-events-hash-id')
  hash_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organiser_id' })
  @Index('idx-calendar-events-organiser-id')
  organiser_id: User;

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

  @OneToMany(
    () => CalendarEventCustomField,
    (customField) => customField.calendar_event_id,
    {
      cascade: true,
    },
  )
  custom_fields: CalendarEventCustomField[];
}
