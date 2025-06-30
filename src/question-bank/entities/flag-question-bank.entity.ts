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
import { AutomatedQuestionBank } from 'src/master/entities/automatedQuestionBank.entity';
import { QuestionFlagStatus } from '../utilities/enums';

/**
 * Represents a flag for an automated question bank.
 * This entity is used to track the status and details of flagged questions.
 *
 * @property {number} id - The unique identifier for the flag.
 * @property {string} status - The status of the flag, which can be one of the values from the QuestionFlagStatus enum.
 * @property {string} flag_description - An optional description of the flag.
 * @property {User} flagged_by_id - The user who flagged the question.
 * @property {User} reviewed_by_id - The user who reviewed the flagged question.
 * @property {AutomatedQuestionBank} question_id - The question that has been flagged.
 * @property {Date} created_at - The timestamp when the flag was created.
 * @property {Date} updated_at - The timestamp when the flag was last updated.
 */
@Entity({ name: 'automated_question_bank_flag' })
@Unique(['flagged_by_id', 'question_id'])
export class AutomatedQuestionBankFlag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    enum: QuestionFlagStatus,
    type: 'enum',
    default: QuestionFlagStatus.flagged,
  })
  @Index('idx-automated-question-bank-flag-status')
  status: string;

  @Column({ nullable: true, type: 'text' })
  flag_description: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flagged_by_id' })
  @Index('idx-automated-question-bank-flag-flagged-by-id')
  flagged_by_id: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewed_by_id' })
  @Index('idx-automated-question-bank-flag-reviewed-by-id')
  reviewed_by_id: User;

  @ManyToOne(() => AutomatedQuestionBank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  @Index('idx-automated-question-bank-flag-question-id')
  question_id: AutomatedQuestionBank;

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
