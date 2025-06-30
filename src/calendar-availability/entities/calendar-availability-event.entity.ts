import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { CalendarAvailability } from './calendar-availabilty.entity';
import { CalendarEvent } from 'src/calendar-events/entities/calendar-event.entity';

/**
 * Entity representing the association between calendar availability and calendar events.
 * This entity is used to track the timing and relationship between availability slots and events.
 *
 * Columns:
 * - id: Primary key for the CalendarAvailabilityTiming entity.
 * - availability_id: Many-to-one relationship with CalendarAvailability.
 * - event_id: Many-to-one relationship with CalendarEvent.
 * - created_at: Timestamp indicating when the record was created.
 * - updated_at: Timestamp indicating when the record was last updated.
 */
@Entity('calendar_availability_event')
@Unique(['event_id', 'availability_id'])
export class CalendarAvailabilityEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CalendarAvailability, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'availability_id' })
  @Index('idx-calendar-availability-event-availability-id')
  availability_id: CalendarAvailability;

  @ManyToOne(() => CalendarEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  @Index('idx-calendar-availability-event-event-id')
  event_id: CalendarEvent;

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
