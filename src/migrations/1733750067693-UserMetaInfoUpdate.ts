import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMetaInfoUpdate1733750067693 implements MigrationInterface {
  name = 'UserMetaInfoUpdate1733750067693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "extracted_resume_text" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "extracted_resume_time" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "extracted_resume_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "extracted_resume_text"`,
    );
  }
}
