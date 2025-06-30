import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutomatedQuestionBankFlag1739765789822
  implements MigrationInterface
{
  name = 'AutomatedQuestionBankFlag1739765789822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "automated_question_bank_flag" ("id" SERIAL NOT NULL, "status" character varying NOT NULL DEFAULT 'flagged', "flag_description" text, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "flagged_by_id" integer, "reviewed_by_id" integer, "question_id" integer, CONSTRAINT "UQ_e931035a3f4f544b0ff950d9074" UNIQUE ("flagged_by_id", "question_id"), CONSTRAINT "PK_ac979d633e7ff38905e9beebe66" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-flag-status" ON "automated_question_bank_flag" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-flag-flagged-by-id" ON "automated_question_bank_flag" ("flagged_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-flag-reviewed-by-id" ON "automated_question_bank_flag" ("reviewed_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-automated-question-bank-flag-question-id" ON "automated_question_bank_flag" ("question_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank_flag" ADD CONSTRAINT "FK_2c9f5cca0440f525748e03c109e" FOREIGN KEY ("flagged_by_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank_flag" ADD CONSTRAINT "FK_b99fdabdadf6ea057c5b0eed0b4" FOREIGN KEY ("reviewed_by_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank_flag" ADD CONSTRAINT "FK_07d6a42bfe6ca5ed577f902be73" FOREIGN KEY ("question_id") REFERENCES "automated_question_bank"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank_flag" DROP CONSTRAINT "FK_07d6a42bfe6ca5ed577f902be73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank_flag" DROP CONSTRAINT "FK_b99fdabdadf6ea057c5b0eed0b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank_flag" DROP CONSTRAINT "FK_2c9f5cca0440f525748e03c109e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-flag-question-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-flag-reviewed-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-flag-flagged-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-automated-question-bank-flag-status"`,
    );
    await queryRunner.query(`DROP TABLE "automated_question_bank_flag"`);
  }
}
