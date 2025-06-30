import { MigrationInterface, QueryRunner } from 'typeorm';

export class GoogleAuthToken1740400705227 implements MigrationInterface {
  name = 'GoogleAuthToken1740400705227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "google_auth_tokens" ("id" SERIAL NOT NULL, "tokens" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "user_id" integer, CONSTRAINT "PK_1443507e1d39eab1dc1965f987a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-google-auth-tokens-user-id" ON "google_auth_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "google_auth_tokens" ADD CONSTRAINT "FK_079522491b5de5838b01105278a" FOREIGN KEY ("user_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "google_auth_tokens" DROP CONSTRAINT "FK_079522491b5de5838b01105278a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-google-auth-tokens-user-id"`,
    );
    await queryRunner.query(`DROP TABLE "google_auth_tokens"`);
  }
}
