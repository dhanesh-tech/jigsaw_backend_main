import { MigrationInterface, QueryRunner } from 'typeorm';

export class HmsRoomRecording1730885072561 implements MigrationInterface {
  name = 'HmsRoomRecording1730885072561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "hms_room_recording" ("id" SERIAL NOT NULL, "room_id" text NOT NULL, "duration_in_seconds" integer, "video_asset_id" text, "video_playback_id" text, "session_id" text NOT NULL, "session_started_at" TIMESTAMP, "session_ended_at" TIMESTAMP, "hms_meta_data" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_3725797249393cc4496648e6495" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-hms-room-recording-room-id" ON "hms_room_recording" ("room_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx-hms-room-recording-room-id"`,
    );
    await queryRunner.query(`DROP TABLE "hms_room_recording"`);
  }
}
