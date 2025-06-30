import { Skill } from '../entities/skill.entity';

export class TopicDto {
  topic_name: string;
  serial_number: number;
  skill_id: Skill;
}
