import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserLoginMethodUpdate1737493373699 implements MigrationInterface {
  name = 'UserLoginMethodUpdate1737493373699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "login_method" character varying NOT NULL DEFAULT 'email'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "login_method"`,
    );
  }
}
