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
import { AssessmentCandidateResponse } from 'src/assessment-response/entities/assessmentCandidateResponse.entity';
import { Expose } from 'class-transformer';
/**
 * AI Interview Analysis Entity
 *
 * Columns:
 * - @property {number} id: Primary key, auto-generated.
 * - @property {any} assessment_question_analysis: The analysis of the assessment question, stored as JSON.
 * - @property {string} asset_id: The identifier for the associated asset.
 * - @property {string} ai_model: The AI model used for generating the analysis (enum).
 * - @property {AssessmentCandidateResponse} assessment_response_id: The identifier for the associated assessment response.
 * - @property {Date} created_at: The timestamp when the analysis was created.
 */
@Entity({ name: 'ai_assessment_question_response_analysis' })
export class AiAssessmentQuestionResponseAnalysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  assessment_question_analysis: any;

  @Column({ type: 'varchar' })
  @Index('idx-ai-assessment-question-analysis-asset-id')
  asset_id: string;

  @Column({
    enum: AI_MODEL,
    type: 'enum',
  })
  @Index('idx-ai-assessment-question-analysis-ai-model')
  @Expose()
  ai_model: string;

  @ManyToOne(() => AssessmentCandidateResponse, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assessment_response_id' })
  @Index('idx-ai-assessment-question-analysis-assessment-response-id')
  assessment_response_id: AssessmentCandidateResponse;

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
