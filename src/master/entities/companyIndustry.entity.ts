import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Company Industry
 * - `id`: Unique identifier
 * - `name`: Name of the industry.
 */
@Entity('company_industries')
export class CompanyIndustry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;
}
