import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Represents a Stripe webhook event in the database.
 *
 * @property {number} id - The unique identifier for the Stripe webhook event.
 * @property {string} event_id - The unique identifier for the Stripe event.
 * @property {string} type - The type of the Stripe event.
 * @property {any} data - The data associated with the Stripe event.
 * @property {boolean} processed - Indicates whether the event has been processed.
 * @property {Date} created_at - The timestamp when the event record was created.
 * @property {Date} updated_at - The timestamp when the event record was last updated.
 *
 * @description This entity stores information about Stripe webhook events received by the application.
 */
@Entity('stripe_webhook_event')
export class StripeWebhookEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar' })
  @Index('idx-stripe-webhook-event-id')
  event_id: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

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
