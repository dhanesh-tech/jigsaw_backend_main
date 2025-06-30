import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSkillUpdate1731077891386 implements MigrationInterface {
  name = 'UserSkillUpdate1731077891386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_skills" ADD "evaluated_rating_value" numeric`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_skills" DROP COLUMN "evaluated_rating_value"`,
    );
  }
}
