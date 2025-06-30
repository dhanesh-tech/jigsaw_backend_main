import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnipileLinkedinInvitations1749643611500
  implements MigrationInterface
{
  name = 'UnipileLinkedinInvitations1749643611500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "unipile_account" ("id" SERIAL NOT NULL, "account_id" character varying NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "user_id" integer, CONSTRAINT "UQ_61192ad4c10340c8906721487c8" UNIQUE ("account_id"), CONSTRAINT "PK_b35ece1b574d0156e34161dcc1b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-unipile-accounts-user-id" ON "unipile_account" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-unipile-accounts-account-id" ON "unipile_account" ("account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-unipile-accounts-status" ON "unipile_account" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "unipile_account" ADD CONSTRAINT "FK_5508e61f44718f143c939b37cd8" FOREIGN KEY ("user_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "unipile_account" DROP CONSTRAINT "FK_5508e61f44718f143c939b37cd8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-unipile-accounts-status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-unipile-accounts-account-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-unipile-accounts-user-id"`,
    );
    await queryRunner.query(`DROP TABLE "unipile_account"`);
  }
}
