import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnipileLinkedinInvitations1749643874713
  implements MigrationInterface
{
  name = 'UnipileLinkedinInvitations1749643874713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "unipile_linkedin_invitation" ("id" SERIAL NOT NULL, "provider_id" character varying NOT NULL, "invitation_id" character varying NOT NULL, "status" character varying NOT NULL, "message" text, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_2f96bb1ec20746b8d205ac3e6f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-linkedin-invitations-provider-id" ON "unipile_linkedin_invitation" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-linkedin-invitations-invitation-id" ON "unipile_linkedin_invitation" ("invitation_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-linkedin-invitations-status" ON "unipile_linkedin_invitation" ("status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx-linkedin-invitations-status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-linkedin-invitations-invitation-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-linkedin-invitations-provider-id"`,
    );
    await queryRunner.query(`DROP TABLE "unipile_linkedin_invitation"`);
  }
}
