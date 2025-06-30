import { MigrationInterface, QueryRunner } from 'typeorm';

export class SkillDifficultyEnum1720730365700 implements MigrationInterface {
  name = 'SkillDifficultyEnum1720730365700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."skill_difficulty_level_enum" AS ENUM('beginner', 'intermediate', 'expert')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE "public"."skill_difficulty_level_enum"`);
  }
}
