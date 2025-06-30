import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Skill } from './skill.entity';

@Entity({ name: 'skill_topic' })
export class Topic {
  // id: number -> primary id of topic
  // topic_name: string; -> name of the topic
  // serial_number: number; -> priority which will be relevant to the HM/Mentor
  // skill_id: Skill; -> references to skills table to which the topic belongs
  // created_at: Date;
  // updated_at: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic_name: string;

  @Column({ default: 1 })
  serial_number: number;

  @ManyToOne(() => Skill, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'skill_id' })
  @Index('idx-topic-skill')
  skill_id: Skill;

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
