import { AssessmentKit } from './assessment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { AutomatedQuestionBank } from 'src/master/entities/automatedQuestionBank.entity';

@Entity({ name: 'assessment_kit_question' })
@Unique(['assessment_id', 'question_bank_question_id'])
export class AssessmentKitQuestion {
  // id: number -> primary id
  // assessment_id: AssessmentKit; -> references to assessment_kit table
  // question_bank_question_id: string; -> references to automated_question_bank table
  // created_at: Date;
  // updated_at: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AssessmentKit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  assessment_id: AssessmentKit;

  @ManyToOne(() => AutomatedQuestionBank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question_bank_question_id: AutomatedQuestionBank;

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
