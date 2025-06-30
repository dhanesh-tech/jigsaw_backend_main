import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutomatedQuetionBankUpdate1729102010921
  implements MigrationInterface
{
  name = 'AutomatedQuetionBankUpdate1729102010921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" ADD "is_ai_generated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" ADD "topic_list" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" DROP COLUMN "is_ai_generated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "automated_question_bank" DROP COLUMN "topic_list"`,
    );
  }
}
