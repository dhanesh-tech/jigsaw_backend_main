import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutomatedQuestionBank1720732300746 implements MigrationInterface {
  name = 'AutomatedQuestionBank1720732300746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."automated_question_bank_difficulty_level_enum" AS ENUM('easy', 'medium', 'hard')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."automated_question_bank_status_enum" AS ENUM('duplicate', 'moderated', 'archived', 'rejected', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "automated_question_bank" ("id" SERIAL NOT NULL, "question_text" character varying NOT NULL, "time_to_answer_in_minutes" integer NOT NULL, "difficulty_level" "public"."automated_question_bank_difficulty_level_enum" NOT NULL, "status" "public"."automated_question_bank_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "skill_id" integer, "topic_id" integer, "created_by_id" integer, "reviewed_by_id" integer, CONSTRAINT "pk_automated_question_bank_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-difficulty-level" ON "automated_question_bank" ("difficulty_level") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-status" ON "automated_question_bank" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-skill-id" ON "automated_question_bank" ("skill_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-created-by-id" ON "automated_question_bank" ("created_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-reviewed-by-id" ON "automated_question_bank" ("reviewed_by_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" ADD CONSTRAINT "fk_automated_question_bank_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" ADD CONSTRAINT "fk_automated_question_bank_topic_id" FOREIGN KEY ("topic_id") REFERENCES "skill_topic"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" ADD CONSTRAINT "fk_automated_question_bank_created_by_id" FOREIGN KEY ("created_by_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" ADD CONSTRAINT "fk_automated_question_bank_reviewed_by_id" FOREIGN KEY ("reviewed_by_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" DROP CONSTRAINT "fk_automated_question_bank_reviewed_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" DROP CONSTRAINT "fk_automated_question_bank_created_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" DROP CONSTRAINT "fk_automated_question_bank_topic_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" DROP CONSTRAINT "fk_automated_question_bank_skill_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-skill-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-difficulty-level"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-reviewed-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-created-by-id"`,
    );
    await queryRunner.query(`DROP TABLE "automated_question_bank"`);
    await queryRunner.query(
      `DROP TYPE "public"."automated_question_bank_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."automated_question_bank_difficulty_level_enum"`,
    );
  }
}
