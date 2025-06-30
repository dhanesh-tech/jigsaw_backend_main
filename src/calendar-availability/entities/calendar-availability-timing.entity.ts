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

import { IsInt, Min, Max } from 'class-validator';
import { CalendarAvailability } from './calendar-availabilty.entity';

/**
 * Entity representing the timing details for calendar availability.
 *
 * Columns:
 * - id: Primary key, auto-generated.
 * - start_time: The start time of the availability period ('2021-09-01T00:00:00.000Z' format).
 * - end_time: The end time of the availability period ('2021-09-01T00:00:00.000Z'format).
 * - week_day: The day of the week (0-6, where 0 is Sunday and 6 is Saturday).
 * - specific_date: A specific date for the availability.
 * - availability_id: Foreign key referencing the CalendarAvailability entity.
 * - created_at: Timestamp when the record was created.
 * - updated_at: Timestamp when the record was last updated.
 */
@Entity({ name: 'calendar_availability_timing' })
export class CalendarAvailabilityTiming {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  start_time: string;

  @Column({ type: 'timestamp' })
  end_time: string;

  @IsInt()
  @Min(0)
  @Max(6)
  @Column({ type: 'int', nullable: true })
  @Index('idx-calendar-availability-timing-week-day')
  week_day: number;

  @Column({ type: 'date', nullable: true })
  @Index('idx-calendar-availability-timing-specific-date')
  specific_date: Date;

  @ManyToOne(() => CalendarAvailability, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'availability_id' })
  @Index('idx-calendar-availability-timing-availability-id')
  availability_id: CalendarAvailability;

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

  json() {
    this.start_time = new Date(this.start_time).toISOString();
    this.end_time = new Date(this.end_time).toISOString();
  }
}
