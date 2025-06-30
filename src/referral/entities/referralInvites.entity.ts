import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
  Unique,
  BeforeInsert,
} from 'typeorm';
import { REFERRAL_INVITE_STATUS } from '../utilities/enum';
import { generateShortUniqueUUID } from 'src/_jigsaw/helpersFunc';
import { Exclude } from 'class-transformer';

/**
 * ReferralInvite entity
 *
 * Fields:
 * - id: Primary key for the referral invite.
 * - user_email: Email of the user being invited.
 * - referral_uuid: Unique identifier for the referral invite.
 * - status: Current status of the referral invite, e.g., pending, accepted, etc.
 * - testimonial_video_asset_id: Asset ID for the testimonial video, if any.
 * - testimonial_video_playback_id: Playback ID for the testimonial video, if any.
 * - testimonial_notes: Additional notes related to the testimonial.
 * - referred_by_id: User who sent the referral invite.
 * - accepted_by_id: User who accepted the referral invite.
 * - created_at: Timestamp when the referral invite was created.
 * - updated_at: Timestamp when the referral invite was last updated.
 */
@Entity({ name: 'referral_invite' })
@Unique(['accepted_by_id'])
export class ReferralInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_email: string;

  @Column({ nullable: true })
  user_name: string;

  @Column({ nullable: true })
  @Exclude()
  user_linkedin_url: string;

  @Index('idx-user-referral-invites-referral-uuid')
  @Column({ unique: true })
  referral_uuid: string;

  @Column({
    enum: REFERRAL_INVITE_STATUS,
    type: 'enum',
    default: REFERRAL_INVITE_STATUS.pending,
  })
  @Index('idx-user-referral-invites-status')
  status: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  video_asset_id: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  video_playback_id: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referred_by' })
  @Index('idx-user-referral-invites-referred-by-id')
  referred_by_id: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accepted_by' })
  @Index('idx-user-referral-invites-accepted-by-id')
  accepted_by_id: User;

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

  // generate a unique uuid of length 10
  @BeforeInsert()
  generateHashId() {
    this.referral_uuid = generateShortUniqueUUID(16);
  }
}
