import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarScheduledInterviewIndexUpdate1741338170943
  implements MigrationInterface
{
  name = 'CalendarScheduledInterviewIndexUpdate1741338170943';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx-calendar-scheduled-interview-is-enabled" ON "calendar_scheduled_interview" ("is_enabled") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx-calendar-scheduled-interview-is-enabled"`,
    );
  }
}
