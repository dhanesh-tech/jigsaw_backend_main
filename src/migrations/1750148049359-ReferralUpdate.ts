import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReferralUpdate1750148049359 implements MigrationInterface {
  name = 'ReferralUpdate1750148049359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referral_invite" ADD "user_linkedin_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" ADD "video_asset_id" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" ADD "video_playback_id" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" ADD "user_name" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "referral_invite" ADD "notes" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP COLUMN "user_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP COLUMN "notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP COLUMN "video_playback_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP COLUMN "video_asset_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral_invite" DROP COLUMN "user_linkedin_url"`,
    );
  }
}
