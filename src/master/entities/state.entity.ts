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
import { Country } from './country.entity';

/**
 * State Entity
 *
 * This entity represents a state within a country. It includes attributes such as the state's name,
 * associated country, state code, and geographical coordinates. Additionally, metadata such as
 * creation and update timestamps, as well as a deletion flag, are stored.
 *
 * - `id`: Unique identifier for the state.
 * - `name`: Name of the state.
 * - `country`: The country to which this state belongs.
 * - `state_id`: Identifier for the state, which may be used for external references.
 * - `state_code`: Code for the state, typically used for postal or administrative purposes.
 * - `latitude`: Geographical latitude of the state.
 * - `longitude`: Geographical longitude of the state.
 * - `created`: Timestamp indicating when the state record was created.
 * - `updated`: Timestamp indicating when the state record was last updated.
 * - `is_deleted`: Flag indicating whether the state record has been marked as deleted.
 */
@Entity('jobs_state')
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index()
  name: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ length: 50, nullable: true })
  state_id: string;

  @Column({ length: 50, nullable: true })
  state_code: string;

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
