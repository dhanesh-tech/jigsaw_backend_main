import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSkillsRatingUpdate1742566781720 implements MigrationInterface {
  name = 'UserSkillsRatingUpdate1742566781720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_skills" ADD "ai_rating_value" numeric`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_skills" DROP COLUMN "ai_rating_value"`,
    );
  }
}
