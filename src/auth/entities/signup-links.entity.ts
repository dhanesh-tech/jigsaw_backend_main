import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { generateHashKeyOnEmail } from 'src/_jigsaw/helpersFunc';

/**
 * User Signup Link Entity
 *
 * Columns:
 * - @property {number} id: Primary key, auto-generated.
 * - @property {string} email: The email address associated with the signup link.
 * - @property {string} role: The role assigned to the user who uses the signup link.
 * - @property {string} token: A unique token for the signup link.
 * - @property {Date} expires_at: The timestamp when the signup link expires.
 * - @property {User} created_by_id: The user who created the signup link.
 * - @property {User} used_by_id: The user who used the signup link.
 * - @property {boolean} is_used: Indicates whether the signup link has been used.
 * - @property {Date} created_at: The timestamp when the signup link was created.
 * - @property {Date} updated_at: The timestamp when the signup link was last updated.
 */

@Entity('user_signup_link')
export class UserSignupLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  role: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  @Index('idx-user-signup-link-token')
  token: string;

  @Column({ type: 'timestamp', nullable: false })
  expires_at: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  @Index('idx-user-signup-link-created-by-id')
  created_by_id: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'used_by_id' })
  @Index('idx-user-signup-link-used-by-id')
  used_by_id: User;

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

  // generate a unique hash id of length 7
  @BeforeInsert()
  generateHashId() {
    const stringToHash = `${this.email}${this.role}${this.id}${this.expires_at.toISOString()}`;
    this.token = generateHashKeyOnEmail(stringToHash, 7);
  }
}
