import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AI_PROMPT_TYPE, AI_MODEL } from '../utilities/enum';

/**
 * AI Prompt Entity
 *
 * Columns:
 * - @property {number} id: Primary key, auto-generated.
 * - @property {string} prompt_type: The type of prompt (enum).
 * - @property {string} ai_model: The AI model used for generating the prompt (enum).
 * - @property {string} prompt_text: The text of the prompt.
 * - @property {Date} created_at: The timestamp when the prompt was created.
 * - @property {Date} updated_at: The timestamp when the prompt was last updated.
 */
@Entity({ name: 'ai_prompt' })
export class AiPrompts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    enum: AI_PROMPT_TYPE,
    type: 'enum',
  })
  @Index('idx-ai-prompt-prompt-type')
  prompt_type: string;

  @Column({
    enum: AI_MODEL,
    type: 'enum',
  })
  @Index('idx-ai-prompt-ai-model')
  ai_model: string;

  @Column({ type: 'text' })
  prompt_text: string;

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
