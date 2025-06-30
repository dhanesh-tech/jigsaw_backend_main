import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'unipile_linkedin_invitation' })
export class LinkedInInvitations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Index('idx-linkedin-invitations-provider-id')
  provider_id: string;

  @Column({ nullable: false })
  @Index('idx-linkedin-invitations-invitation-id')
  invitation_id: string;

  @Column({ nullable: false })
  @Index('idx-linkedin-invitations-status')
  status: string;

  @Column({ type: 'text', nullable: true })
  message: string;

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
