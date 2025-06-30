import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { State } from './state.entity';

/**
 * City Entity
 *
 * This entity represents a city. It contains details such as the city's name, associated state,
 * geographical coordinates (latitude and longitude), and metadata about when the record was created,
 * last updated, and whether it has been marked as deleted.
 *
 * - `id`: Unique identifier for the city.
 * - `name`: Name of the city.
 * - `state`: The state to which this city belongs.
 * - `latitude`: Geographical latitude of the city.
 * - `longitude`: Geographical longitude of the city.
 * - `created`: Timestamp indicating when the city record was created.
 * - `updated`: Timestamp indicating when the city record was last updated.
 * - `is_deleted`: Flag indicating whether the city record has been marked as deleted.
 */
@Entity('jobs_city')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index()
  name: string;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column({ length: 50, nullable: true })
  latitude: string;

  @Column({ length: 50, nullable: true })
  longitude: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ default: false })
  is_deleted: boolean;
}
