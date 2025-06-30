import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiTranscription1740988948428 implements MigrationInterface {
  name = 'AiTranscription1740988948428';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_transcription" ("id" SERIAL NOT NULL, "transcription_response" jsonb NOT NULL, "asset_id" character varying NOT NULL, "ai_model" character varying NOT NULL, "chunk_name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_e8330cb6f90cfde0d46ff0ffa39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-transcription-asset-id" ON "ai_transcription" ("asset_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-transcription-ai-model" ON "ai_transcription" ("ai_model") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-transcription-ai-model"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-transcription-asset-id"`,
    );
    await queryRunner.query(`DROP TABLE "ai_transcription"`);
  }
}
