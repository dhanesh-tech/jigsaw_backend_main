import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from 'src/master/entities/company.entity';
import { Exclude } from 'class-transformer';
import { Country } from 'src/master/entities/country.entity';

/**
 * Represents the meta information of a user.
 *
 * @class UserMetaInfo
 * @property {number} id - The primary key of the user meta info.
 * @property {string} resume - The resume of the user, stored as text and can be nullable.
 * @property {string} phone - The phone number of the user, stored as a char with a length of 16 and can be nullable. This field is excluded from certain operations.
 * @property {string} linkedin_url - The LinkedIn URL of the user, stored as text and can be nullable.
 * @property {string} headline - The headline of the user, stored as text and can be nullable.
 * @property {string} gender - The gender of the user, stored as varchar and can be nullable.
 * @property {string} profile_image - The profile image of the user, stored as text and can be nullable.
 * @property {boolean} is_currently_working - Indicates if the user is currently working, stored as boolean with a default value of false.
 * @property {Company} company_id - The company associated with the user, can be nullable and is set to null on delete.
 * @property {User} user_id - The user associated with this meta info, with a one-to-one relationship and cascade option enabled.
 * @property {Date} created_at - The timestamp when the record was created, with a default value of the current timestamp.
 * @property {Date} updated_at - The timestamp when the record was last updated, with a default value of the current timestamp and updates on record update.
 */
@Entity('users_usermetainfo')
export class UserMetaInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  resume: string;

  @Column({ type: 'char', length: 16, nullable: true })
  @Exclude()
  phone: string;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  linkedin_url: string;

  @Column({ type: 'text', nullable: true })
  headline: string;

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ type: 'text', nullable: true })
  profile_image: string;

  @Column({ type: 'boolean', default: false })
  is_currently_working: boolean;

  @ManyToOne(() => Company, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'company_id' })
  company_id: Company;

  @ManyToOne(() => Country, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'country_id' })
  country_id: Country;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  @Index('idx-users-usermetainfo-user-id')
  user_id: User;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  extracted_resume_text: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  extracted_resume_time: Date;

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
