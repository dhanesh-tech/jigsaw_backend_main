import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AssessmentCandidateResponse } from './assessmentCandidateResponse.entity';

@Entity({ name: 'assessment_candidate_question_response_rating' })
@Unique(['assessment_candidate_question_response_id', 'rated_by_id'])
export class AssessmentCandidateResponseRating {
  // id: number -> primary id
  // rating_value: number; -> rating given on QuestionResponse
  // comment: string -> additional comment added on QuestionResponse
  // assessment_candidate_question_response_id: AssessmentCandidateResponse -> references to assessment_candidate_question_response table
  // rated_by_id: User; -> references to users_customuser table
  // is_ai_generated: boolean -> flag to check if rating is given by AI
  // created_at: Date;
  // updated_at: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating_value: number;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => AssessmentCandidateResponse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_candidate_question_response_id' })
  @Index(
    'idx-assessment-candidate-question-response-rating-assessment-candidate-question-response-id',
  )
  assessment_candidate_question_response_id: AssessmentCandidateResponse;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rated_by_id' })
  @Index('idx-assessment-candidate-question-response-rating-rated-by-id')
  rated_by_id: User;

  @Column({ default: false })
  @Index('idx-assessment-candidate-question-response-rating-ai-generated')
  is_ai_generated: boolean;

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
