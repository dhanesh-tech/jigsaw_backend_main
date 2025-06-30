import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Skills Entity
 *
 * This entity represents a skill. It includes
 * the skill name and metadata about when the record was created and last updated.
 *
 * - `id`: Unique identifier for the skill.
 * - `skill_name`: Name of the skill.
 * - `updated`: Timestamp indicating when the skill record was last updated.
 * - `created`: Timestamp indicating when the skill record was created.
 */

@Entity({ name: 'skills' })
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  skill_name: string;

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
