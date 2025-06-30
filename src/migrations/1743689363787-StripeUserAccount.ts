import { MigrationInterface, QueryRunner } from 'typeorm';

export class StripeUserAccount1743689363787 implements MigrationInterface {
  name = 'StripeUserAccount1743689363787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stripe_user_account" ("id" SERIAL NOT NULL, "account_id" character varying NOT NULL, "status" character varying NOT NULL, "account_details" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "user_id" integer, CONSTRAINT "UQ_f3a13a3220b290cf185542f68d9" UNIQUE ("account_id"), CONSTRAINT "UQ_f050a6407532bb32c0955466fa4" UNIQUE ("account_id", "user_id"), CONSTRAINT "PK_0493c7b817197c95cd4c4876b01" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-stripe-user-account-user-id" ON "stripe_user_account" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "stripe_user_account" ADD CONSTRAINT "FK_7744bee958c135280ea5a738a0a" FOREIGN KEY ("user_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stripe_user_account" DROP CONSTRAINT "FK_7744bee958c135280ea5a738a0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-stripe-user-account-user-id"`,
    );
    await queryRunner.query(`DROP TABLE "stripe_user_account"`);
  }
}
