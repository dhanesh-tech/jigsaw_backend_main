import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiPrompts1740988717912 implements MigrationInterface {
  name = 'AiPrompts1740988717912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_prompt" ("id" SERIAL NOT NULL, "prompt_type" varchar NOT NULL, "ai_model" varchar NOT NULL, "prompt_text" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_c773812908b6563a53c47144e7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-prompt-prompt-type" ON "ai_prompt" ("prompt_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-prompt-ai-model" ON "ai_prompt" ("ai_model") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx-ai-prompt-ai-model"`);
    await queryRunner.query(`DROP INDEX "public"."idx-ai-prompt-prompt-type"`);
    await queryRunner.query(`DROP TABLE "ai_prompt"`);
  }
}
