import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMetaInfo1732194043767 implements MigrationInterface {
  name = 'UserMetaInfo1732194043767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "users_usermetainfo_company_id_ae151048_fk_users_company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "users_usermetainfo_user_id_dd1b47e7_fk_users_customuser_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."users_usermetainfo_company_id_ae151048"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "work_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `UPDATE "users_usermetainfo" SET "created_at"="created"`,
    );
    await queryRunner.query(
      `UPDATE "users_usermetainfo" SET "updated_at"="updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "is_currently_working" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "company_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "linkedin_url" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "headline" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "gender" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "users_usermetainfo_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "PK_966094f42751d50e7cbd58fcdcb" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "users_usermetainfo_user_id_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "UQ_1ca2b6fc33d0ee847d9e8adbf27" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-users-usermetainfo-user-id" ON "users_usermetainfo" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "FK_8e80449a80a18b3c5e8cca87c1f" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "FK_1ca2b6fc33d0ee847d9e8adbf27" FOREIGN KEY ("user_id") REFERENCES "users_customuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "FK_1ca2b6fc33d0ee847d9e8adbf27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "FK_8e80449a80a18b3c5e8cca87c1f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-users-usermetainfo-user-id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "UQ_1ca2b6fc33d0ee847d9e8adbf27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "users_usermetainfo_user_id_key" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP CONSTRAINT "PK_966094f42751d50e7cbd58fcdcb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "users_usermetainfo_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "is_currently_working"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "linkedin_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "headline"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "gender"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "company_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "created" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "updated" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "users_usermetainfo" SET "created"="created_at"`,
    );
    await queryRunner.query(
      `UPDATE "users_usermetainfo" SET "updated"="updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD "work_status" character varying(500)`,
    );

    await queryRunner.query(
      `CREATE INDEX "users_usermetainfo_company_id_ae151048" ON "users_usermetainfo" ("company_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "users_usermetainfo_user_id_dd1b47e7_fk_users_customuser_id" FOREIGN KEY ("user_id") REFERENCES "users_customuser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_usermetainfo" ADD CONSTRAINT "users_usermetainfo_company_id_ae151048_fk_users_company_id" FOREIGN KEY ("company_id") REFERENCES "users_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
  }
}
