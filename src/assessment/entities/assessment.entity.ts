import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ASSESSMENT_STATUS } from '../utilities/enum';
import { generateAssessmentHashId } from '../utilities/helpers';
import { AssessmentKitSkill } from './assessmentSkill.entity';
import { AssessmentKitQuestion } from './assessmentQuestion.entity';

@Entity({ name: 'assessment_kit' })
export class AssessmentKit {
  // id: number -> primary id
  // title: string; -> title of assessment kit
  // hash_id: string; -> unique id to identify assessment in public view
  // additional_notes: string; -> notes about assessment
  // total_questions: number; -> number of question to ask
  // status: string; -> assessment status enum [ 'draft', 'publish', 'archived',]
  // created_by_id: User; -> references to users_customuser table to which the
  // skills: Skill -> OnetoMany relation to serialize skills data
  // questions: AssessmentKitQuestion -> OnetoMany relation to serialize questions data
  // created_at: Date;
  // updated_at: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  @Index('idx-assesssment-kit-hash-id')
  hash_id: string;

  @Column({ nullable: true })
  additional_notes: string;

  @Column()
  total_questions: number;

  @Column({
    enum: ASSESSMENT_STATUS,
    type: 'enum',
    default: ASSESSMENT_STATUS.draft,
  })
  @Index('idx-assesssment-kit-status')
  status: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  @Index('idx-assesssment-kit-created-by-id')
  created_by_id: User;

  @BeforeInsert()
  generateHashId() {
    this.hash_id = generateAssessmentHashId();
  }

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
    () => AssessmentKitSkill,
    (assessmentKitSkill) => assessmentKitSkill.assessment_id,
  )
  skills: AssessmentKitSkill[];

  @OneToMany(
    () => AssessmentKitQuestion,
    (assessmentKitQuestion) => assessmentKitQuestion.assessment_id,
  )
  questions: AssessmentKitQuestion[];
}
