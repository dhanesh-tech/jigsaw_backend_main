import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMetaInfoCountryUpdate1744195992502
  implements MigrationInterface
{
  name = 'UserMetaInfoCountryUpdate1744195992502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "country_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "FK_e612aaeb40fefc30a5963e88886" FOREIGN KEY ("country_id") REFERENCES "jobs_country"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "country_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "FK_e612aaeb40fefc30a5963e88886"`,
    );
  }
}
