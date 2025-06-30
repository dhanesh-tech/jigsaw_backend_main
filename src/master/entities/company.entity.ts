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
} from 'typeorm';

/**
 * Represents a company entity.
 *
 * @entity
 *
 * @property {number} id - The primary key of the company.
 * @property {string} [name] - The name of the company.
 * @property {string} [contact_phone] - The contact phone number of the company.
 * @property {string} [support_email] - The support email of the company.
 * @property {string} domain_url - The unique domain URL of the company e.g. 'example.com'.
 * @property {string} hash_id - The unique hash ID of the company.
 * @property {boolean} is_verified - Indicates if the company is verified.
 * @property {User} admin_id - The admin user associated with the company.
 * @property {Date} created_at - The timestamp when the company was created.
 * @property {Date} updated_at - The timestamp when the company was last updated.
 *
 * @method generateHashId - Generates a unique hash ID before inserting the company entity.
 */
@Entity('company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ nullable: true })
  support_email: string;

  @Column({ unique: true })
  domain_url: string;

  @Column({ length: 20, unique: true })
  @Index('idx-company-hash-id')
  hash_id: string;

  @Column({ default: true })
  is_verified: boolean;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'admin_id' })
  admin_id: User;

  @BeforeInsert()
  generateHashId() {
    this.hash_id = generateShortUniqueUUID(20);
  }

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
