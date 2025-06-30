import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReferralInvite1724310620330 implements MigrationInterface {
  name = 'ReferralInvite1724310620330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."referral_invite_status_enum" AS ENUM('accepted', 'pending', 'declined', 'invalid')`,
    );
    await queryRunner.query(
      `CREATE TABLE "referral_invite" ("id" SERIAL NOT NULL, "user_email" character varying, "status" "public"."referral_invite_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "referral_uuid" character varying NOT NULL, "referred_by" integer NOT NULL, "accepted_by" integer, CONSTRAINT "UQ_d0ab3d362557ae0256cbaca08b4" UNIQUE ("accepted_by"), CONSTRAINT "PK_85da456ea13b17c35fa12ed7183" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-referral-invites-status" ON "referral_invite" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-referral-invites-referred-by-id" ON "referral_invite" ("referred_by") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-referral-invites-accepted-by-id" ON "referral_invite" ("accepted_by") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-referral-invites-referral-uuid" ON "referral_invite" ("referral_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" ADD CONSTRAINT "UQ_ef0066f9cc6426af0f4a18a474b" UNIQUE ("referral_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" ADD CONSTRAINT "FK_5229150ed8e703dcdd4947e65d0" FOREIGN KEY ("referred_by") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" ADD CONSTRAINT "FK_d0ab3d362557ae0256cbaca08b4" FOREIGN KEY ("accepted_by") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP CONSTRAINT "FK_d0ab3d362557ae0256cbaca08b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP CONSTRAINT "FK_5229150ed8e703dcdd4947e65d0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-user-referral-invites-accepted-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-user-referral-invites-referred-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-user-referral-invites-status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-user-referral-invites-referral-uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP CONSTRAINT "UQ_ef0066f9cc6426af0f4a18a474b"`,
    );
    await queryRunner.query(`DROP TABLE "referral_invite"`);
    await queryRunner.query(`DROP TYPE "public"."referral_invite_status_enum"`);
  }
}
