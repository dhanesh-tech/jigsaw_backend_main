import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { PRIMARY_ROLE_DEPARTMENTS } from '../utilities/enum';

/**
 * Job Primary Role
 * - `id`: Unique identifier
 * - `title`: Name of the role.
 * - `department`: Department to which the role belongs
 */
@Entity('job_primary_role')
export class JobPrimaryRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    enum: PRIMARY_ROLE_DEPARTMENTS,
    type: 'enum',
  })
  department: string;
}
