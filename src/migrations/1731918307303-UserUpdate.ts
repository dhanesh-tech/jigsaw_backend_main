import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserUpdate1731920894258 implements MigrationInterface {
  name = 'UserUpdate1731920894258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP CONSTRAINT "users_customuser_created_by_id_263422fc_fk_users_customuser_id"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."users_custo_full_na_b65db1_idx"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."users_customuser_email_6445acef_like"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."users_customuser_created_by_id_263422fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."users_custo_referra_4cecc0_idx"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."users_customuser_referral_code_a3b541b6_like"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "first_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "last_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "is_staff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "date_joined"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "created_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "profile_claimed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `UPDATE "users_customuser" SET "created_at" = "created"`,
    );
    await queryRunner.query(
      `UPDATE "users_customuser" SET "updated_at"="updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP CONSTRAINT "users_customuser_email_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD CONSTRAINT "UQ_d78501824b637d6c093ac4cdb4a" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ALTER COLUMN "is_superuser" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ALTER COLUMN "is_active" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ALTER COLUMN "is_verified" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD CONSTRAINT "UQ_4fd8642aa4ba95a74086b9a607c" UNIQUE ("hash_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-custom-user-role" ON "users_customuser" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-custom-user-full-name" ON "users_customuser" ("full_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-custom-user-hash-id" ON "users_customuser" ("hash_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-custom-user-referral-code" ON "users_customuser" ("referral_code") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx-custom-user-referral-code"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx-custom-user-hash-id"`);
    await queryRunner.query(`DROP INDEX "public"."idx-custom-user-full-name"`);
    await queryRunner.query(`DROP INDEX "public"."idx-custom-user-role"`);
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP CONSTRAINT "UQ_4fd8642aa4ba95a74086b9a607c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ALTER COLUMN "is_verified" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ALTER COLUMN "is_active" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ALTER COLUMN "is_superuser" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP CONSTRAINT "UQ_d78501824b637d6c093ac4cdb4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD CONSTRAINT "users_customuser_email_key" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "profile_claimed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "created_by_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "created" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "updated" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "users_customuser" SET "created"="created_at"`,
    );
    await queryRunner.query(
      `UPDATE "users_customuser" SET "updated"="updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "date_joined" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "is_staff" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "last_name" character varying(150)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD "first_name" character varying(150)`,
    );

    await queryRunner.query(
      `CREATE INDEX "users_customuser_referral_code_a3b541b6_like" ON "users_customuser" ("referral_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "users_custo_referra_4cecc0_idx" ON "users_customuser" ("referral_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "users_customuser_created_by_id_263422fc" ON "users_customuser" ("created_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "users_customuser_email_6445acef_like" ON "users_customuser" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "users_custo_full_na_b65db1_idx" ON "users_customuser" ("full_name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_customuser" ADD CONSTRAINT "users_customuser_created_by_id_263422fc_fk_users_customuser_id" FOREIGN KEY ("created_by_id") REFERENCES "users_customuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
  }
}
