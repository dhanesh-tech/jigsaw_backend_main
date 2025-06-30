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
import { CalendarEvent } from './calendar-event.entity';

/**
 * Represents a custom field for a calendar event.
 *
 * @entity calendar_event_custom_field
 *
 * -  id - The unique identifier for the custom field.
 * -  question_text - The custom question associated with the calendar event.
 * -  is_required - Indicates if the custom question is mandatory.
 * -  calendar_event_id - The calendar event associated with this custom field.
 */
@Entity('calendar_event_custom_field')
export class CalendarEventCustomField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question_text: string;

  @Column({ default: false })
  is_required: boolean;

  @ManyToOne(() => CalendarEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calendar_event_id' })
  @Index('idx-calendar-event-custom-field-event-id')
  calendar_event_id: CalendarEvent;

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
