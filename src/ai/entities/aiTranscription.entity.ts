import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AI_MODEL } from '../utilities/enum';
import { Expose } from 'class-transformer';
/**
 * AI Transcription Entity
 *
 * @property {number} id - The unique identifier for the transcription.
 * @property {any} transcription_response - The text of the transcription, stored as JSON.
 * @property {string} asset_id - The identifier for the associated asset.
 * @property {string} ai_model - The AI model used for generating the transcription.
 * @property {Date} created_at - The timestamp when the transcription was created.
 * @property {Date} updated_at - The timestamp when the transcription was last updated.
 */

@Entity({ name: 'ai_transcription' })
export class AiTranscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  transcription_response: any;

  @Column({ type: 'varchar' })
  @Index('idx-ai-transcription-asset-id')
  asset_id: string;

  @Column({
    enum: AI_MODEL,
    type: 'enum',
  })
  @Index('idx-ai-transcription-ai-model')
  @Expose()
  ai_model: string;

  @Column({ type: 'varchar' })
  chunk_name: string;

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
