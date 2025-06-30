import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AutomatedQuestionBank } from 'src/master/entities/automatedQuestionBank.entity';
import { AssessmentCandidateResponseRating } from './assessmentCandidateResponseRating.entity';
import { QUESTION_RESPONSE_STATUS } from '../utilities/enum';
import { AssessmentKit } from 'src/assessment/entities/assessment.entity';
import { AiAssessmentQuestionResponseAnalysis } from 'src/ai/entities/aiAssessmentQuestionAnalysis.entity';
@Entity({ name: 'assessment_candidate_question_response' })
@Unique(['candidate_id', 'question_id'])
export class AssessmentCandidateResponse {
  // id: number -> primary id
  // status: string; -> assessment question response status enum ['sent', 'shown', 'answered','skipped']
  // video_playback_id: string -> stores candidate's response mux playback_id
  // video_asset_id: string -> stores candidate's response mux asset_id
  // assessment_id: AssessmentKit; -> references to assessment_kit table
  // candidate_id: User -> references to users_customuser table
  // question_id: AutomatedQuestionBank -> references to automated_question_bank table
  // candidate_response_rating_id:AssessmentCandidateResponseRating -> OnetoMany relation to serialize question rating data
  // candidate_response_transcription: any -> stores candidate's response transcription
  // created_at: Date;
  // updated_at: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    enum: QUESTION_RESPONSE_STATUS,
    type: 'enum',
    default: QUESTION_RESPONSE_STATUS.sent,
  })
  @Index('idx-assessment-candidate-question-response-status')
  status: string;

  @Column({ nullable: true })
  video_playback_id: string;

  @Column({ nullable: true })
  video_asset_id: string;

  @ManyToOne(() => AssessmentKit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assessment_id' })
  @Index('idx-assessment-candidate-question-response-assessment-id')
  assessment_id: AssessmentKit;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  @Index('idx-assessment-candidate-question-response-candidate-id')
  candidate_id: User;

  @ManyToOne(() => AutomatedQuestionBank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  @Index('idx-assessment-candidate-question-response-question-id')
  question_id: AutomatedQuestionBank;

  @Column({ type: 'jsonb', nullable: true })
  candidate_response_transcription: any;

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

  @OneToMany(
    () => AssessmentCandidateResponseRating,
    (candidate_response_rating) =>
      candidate_response_rating.assessment_candidate_question_response_id,
  )
  candidate_response_ratings: AssessmentCandidateResponseRating[];

  @OneToMany(
    () => AiAssessmentQuestionResponseAnalysis,
    (ai_assessment_question_analysis) =>
      ai_assessment_question_analysis.assessment_response_id,
  )
  ai_assessment_question_analysis: AiAssessmentQuestionResponseAnalysis[];
}
