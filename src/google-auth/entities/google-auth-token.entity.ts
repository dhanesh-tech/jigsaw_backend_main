import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Represents a Google authentication token associated with a user.
 *
 * @entity google_auth_tokens
 *
 * - id: The unique identifier for the Google authentication token.
 * - tokens: The JSON object containing the authentication tokens (e.g., access token, refresh token).
 * - user_id: This field references the User entity and is set to cascade on delete.
 * - created_at: The timestamp when token was created.
 * - updated_at: The timestamp when token was last updated
 */
@Entity({ name: 'google_auth_tokens' })
export class GoogleAuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  tokens: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index('idx-google-auth-tokens-user-id')
  user_id: User;

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
