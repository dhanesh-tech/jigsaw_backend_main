import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * Entity representing a room recording in the HMS system.
 *
 * Columns:
 * - id: Primary key for the recording entity.
 * - room_id: Identifier for the room.
 * - recording_url: URL of the recording.
 * - duration_in_seconds: Duration of the recording in seconds.
 * - video_asset_id: (Optional) Identifier for the video asset.
 * - video_playback_id: (Optional) Identifier for the video playback.
 * - session_id: Identifier for the session.
 * - session_started_at: Timestamp when the session started.
 * - session_ended_at: Timestamp when the session ended.
 * - hms_meta_data: (Optional) Metadata related to the HMS system.
 * - created_at: Timestamp when the record was created.
 * - updated_at: Timestamp when the record was last updated.
 */
@Entity({ name: 'hms_room_recording' })
@Unique(['room_id', 'session_id'])
export class HmsRoomRecording {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @Index('idx-hms-room-recording-room-id')
  room_id: string;

  @Column({ type: 'integer', nullable: true })
  duration_in_seconds: number;

  @Column({ type: 'text', nullable: true })
  video_asset_id: string;

  @Column({ type: 'text', nullable: true })
  video_playback_id: string;

  @Column({ type: 'text', nullable: true })
  session_id: string;

  @Column({ type: 'timestamp', nullable: true })
  session_started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  session_ended_at: Date;

  @Exclude()
  @Column({ type: 'jsonb' })
  hms_meta_data: any;

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
