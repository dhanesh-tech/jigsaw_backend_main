import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AI_MODEL } from '../utilities/enum';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';
import { Expose } from 'class-transformer';
/**
 * AI Interview Analysis Entity
 *
 * Columns:
 * - @property {number} id: Primary key, auto-generated.
 * - @property {any} interview_analysis: The analysis of the interview, stored as JSON.
 * - @property {string} asset_id: The identifier for the associated asset.
 * - @property {string} ai_model: The AI model used for generating the analysis (enum).
 * - @property {CalendarScheduledInterview} interview_id: The identifier for the associated interview.
 * - @property {Date} created_at: The timestamp when the analysis was created.
 * - @property {Date} updated_at: The timestamp when the analysis was last updated.
 */
@Entity({ name: 'ai_interview_analysis' })
export class AiInterviewAnalysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  interview_analysis: any;

  @Column({ type: 'varchar' })
  @Index('idx-ai-interview-analysis-asset-id')
  asset_id: string;

  @Column({
    enum: AI_MODEL,
    type: 'enum',
  })
  @Index('idx-ai-interview-analysis-ai-model')
  @Expose()
  ai_model: string;

  @ManyToOne(() => CalendarScheduledInterview, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'interview_id' })
  @Index('idx-ai-interview-analysis-interview-id')
  interview_id: CalendarScheduledInterview;

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
