import { UserTimezoneConstants } from 'src/_jigsaw/enums';
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
import { CalendarAvailabilityTiming } from './calendar-availability-timing.entity';

/**
 * The CalendarAvailability entity represents an availability in the calendar.
 *
 * Columns:
 * - id: Primary key for the calendar availability.
 * - title: Title of the availability.
 * - hash_id: Unique hash ID for the availability.
 * - user_id: Reference to the user
 * - created_at: Timestamp when the availability was created.
 * - updated_at: Timestamp when the availability was last updated.
 */
@Entity({ name: 'calendar_availability' })
export class CalendarAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    enum: UserTimezoneConstants,
    type: 'enum',
    default: UserTimezoneConstants.UTC,
  })
  timezone: string;

  @Column({ unique: true })
  @Index('idx-calendar-availability-hash-id')
  hash_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index('idx-calendar-availability-user-id')
  user_id: User;

  @BeforeInsert()
  generateHashId() {
    this.hash_id = generateShortUniqueUUID(16);
  }

  @OneToMany(
    () => CalendarAvailabilityTiming,
    (timing) => timing.availability_id,
  )
  timings: CalendarAvailabilityTiming[];

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
