import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { STRIPE_ACCOUNT_STATUS } from '../utilities/enum';
import { User } from 'src/users/entities/user.entity';
import { Exclude } from 'class-transformer';

/**
 * Represents a Stripe user account in the database.
 *
 * @Entity('stripe_user_account')
 * @Unique(['account_id', 'user_id'])
 *
 * @property {number} id - The unique identifier for the Stripe user account.
 * @property {string} account_id - The unique identifier for the Stripe account.
 * @property {STRIPE_ACCOUNT_STATUS} status - The current status of the Stripe account.
 * @property {User} user_id - The user associated with the Stripe account.
 * @property {any} account_details - Additional details related to the Stripe account.
 * @property {Date} created_at - The timestamp when the Stripe account was created.
 * @property {Date} updated_at - The timestamp when the Stripe account was last updated.
 *
 * @description This entity stores information about a Stripe account associated with a user.
 */
@Entity('stripe_user_account')
@Unique(['account_id', 'user_id'])
export class StripeUserAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar' })
  account_id: string;

  @Column({
    enum: STRIPE_ACCOUNT_STATUS,
    type: 'enum',
    default: STRIPE_ACCOUNT_STATUS.pending,
  })
  status: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  @Index('idx-stripe-user-account-user-id')
  user_id: User;

  @Column({ type: 'jsonb', nullable: true })
  @Exclude()
  account_details: any;

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
