import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarScheduledInterviewUpdate1735216933061
  implements MigrationInterface
{
  name = 'CalendarScheduledInterviewUpdate1735216933061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" ADD "is_enabled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_scheduled_interview" DROP COLUMN "is_enabled"`,
    );
  }
}
