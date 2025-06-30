import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Country Entity
 *
 * This entity represents a country. It includes attributes like country name, ISO codes, phone code,
 * capital, currency information, and geographical coordinates. Additionally, metadata such as
 * creation and update timestamps, as well as a deletion flag, are stored.
 *
 * - `id`: Unique identifier for the country.
 * - `name`: Name of the country.
 * - `iso3`: 3-letter ISO code for the country.
 * - `iso2`: 2-letter ISO code for the country.
 * - `numeric_code`: Numeric code for the country.
 * - `phone_code`: International phone code for the country.
 * - `capital`: Capital city of the country.
 * - `currency`: Primary currency used in the country.
 * - `currency_name`: Full name of the currency.
 * - `latitude`: Geographical latitude of the country.
 * - `longitude`: Geographical longitude of the country.
 * - `created`: Timestamp indicating when the country record was created.
 * - `updated`: Timestamp indicating when the country record was last updated.
 * - `is_deleted`: Flag indicating whether the country record has been marked as deleted.
 */
@Entity('jobs_country')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  @Index()
  name: string;

  @Column({ length: 50, nullable: true })
  iso3: string;

  @Column({ length: 50, nullable: true })
  iso2: string;

  @Column({ length: 50, nullable: true })
  numeric_code: string;

  @Column({ length: 50, nullable: true })
  phone_code: string;

  @Column({ length: 50, nullable: true })
  capital: string;

  @Column({ length: 50, nullable: true })
  currency: string;

  @Column({ length: 250, nullable: true })
  currency_name: string;

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
