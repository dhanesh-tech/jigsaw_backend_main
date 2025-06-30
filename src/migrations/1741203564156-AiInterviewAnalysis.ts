import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiInterviewAnalysis1741203564156 implements MigrationInterface {
  name = 'AiInterviewAnalysis1741203564156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_interview_analysis" ("id" SERIAL NOT NULL, "interview_analysis" jsonb NOT NULL, "asset_id" character varying NOT NULL, "ai_model" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "interview_id" integer, CONSTRAINT "PK_4f8db17ef00d7897a59ef5cb9d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-interview-analysis-asset-id" ON "ai_interview_analysis" ("asset_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-interview-analysis-ai-model" ON "ai_interview_analysis" ("ai_model") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-ai-interview-analysis-interview-id" ON "ai_interview_analysis" ("interview_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_interview_analysis" ADD CONSTRAINT "FK_a11247cf4471e3e2edb893aa64a" FOREIGN KEY ("interview_id") REFERENCES "calendar_scheduled_interview"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_interview_analysis" DROP CONSTRAINT "FK_a11247cf4471e3e2edb893aa64a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-interview-analysis-interview-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-interview-analysis-ai-model"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-ai-interview-analysis-asset-id"`,
    );
    await queryRunner.query(`DROP TABLE "ai_interview_analysis"`);
  }
}
