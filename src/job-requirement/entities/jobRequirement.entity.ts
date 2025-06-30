/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { State } from 'src/master/entities/state.entity';
import { City } from 'src/master/entities/city.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CurrencyChoices,
  EmploymentType,
  Experience,
  ExpertiseLevel,
  JobPostStatus,
  PaymentType,
} from '../utilities/enum';
import { CompanyIndustry } from 'src/master/entities/companyIndustry.entity';
import { Country } from 'src/master/entities/country.entity';
import { JobRequirementSkill } from './jobRequirementSkill.entity';
import { JobPrimaryRole } from 'src/master/entities/jobPrimaryRole.entity';

@Entity('job_requirements')
@Index('idx_job_requirements_title', ['title'])
@Index('idx_job_requirements_posted_by_id', ['posted_by_id'])
@Index('idx_job_requirements_employment_type', ['employment_type'])
@Index('idx_job_requirements_experience', ['experience'])
@Index('idx_job_requirements_status', ['status'])
export class JobRequirement {
  /**
   * Entity representing a Job Requirement.
   * - `id`: Primary key of the job requirement.
   * - `title`: The title of the job requirement.
   * - `country_id`: Many-to-One relationship with Country entity.
   * - `state_id`: Many-to-One relationship with State entity.
   * - `city_id`: Many-to-One relationship with City entity.
   * - `is_remote`: Boolean indicating if the job is remote.
   * - `description`: Text description of the job requirement.
   * - `company_industry_id`: Foreign key referencing the industry of the job.
   * - `primary_role_id`: Foreign key referencing to JobJobPrimaryRole.
   * - `employment_type`: Enum representing the type of employment.
   * - `experience`: Enum representing the experience level required.
   * - `expertise`: Enum representing the expertise level required.
   * - `status`: Enum representing the status of the job requirement.
   * - `payment_type`: Enum representing the payment type.
   * - `payment_from`: The minimum payment amount.
   * - `payment_to`: The maximum payment amount.
   * - `payment_currency`: Enum representing the currency for payment.
   * - `created_at`: Timestamp of when the job requirement was created.
   * - `updated_at`: Timestamp of when the job requirement was last updated.
   * - `is_deleted`: Boolean indicating if the job requirement is deleted.
   * - `posted_by_id`: Many-to-One relationship with User entity representing the user who posted the job.
   * - `skills`: One-to-Many relationship with JobRequirementSkill entity representing the skills required for the job.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ManyToOne(() => Country, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'country_id' })
  country_id: Country;

  @ManyToOne(() => State, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'state_id' })
  state_id: State;

  @ManyToOne(() => City, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'city_id' })
  city_id: City;

  @Column({ type: 'boolean', default: false })
  is_remote: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => CompanyIndustry, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'company_industry_id' })
  company_industry_id: CompanyIndustry;

  @ManyToOne(() => JobPrimaryRole, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'primary_role_id' })
  primary_role_id: JobPrimaryRole;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    nullable: true,
  })
  employment_type: EmploymentType;

  @Column({
    type: 'enum',
    enum: Experience,
    nullable: true,
  })
  experience: Experience;

  @Column({
    type: 'enum',
    enum: ExpertiseLevel,
    nullable: true,
  })
  expertise: ExpertiseLevel;

  @Column({
    type: 'enum',
    enum: JobPostStatus,
    nullable: true,
  })
  status: JobPostStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
    nullable: true,
  })
  payment_type: PaymentType;

  @Column({ type: 'int', nullable: true })
  payment_from: number;

  @Column({ type: 'int', nullable: true })
  payment_to: number;

  @Column({
    type: 'enum',
    enum: CurrencyChoices,
    nullable: true,
  })
  payment_currency: CurrencyChoices;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  // to do ->  add option of archiving jobs when user is deleted and move to different table
  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'posted_by_id' })
  posted_by_id: User;

  @OneToMany(
    () => JobRequirementSkill,
    (jobSkill) => jobSkill.jobrequirement_id,
  )
  skills: JobRequirementSkill[];
}
