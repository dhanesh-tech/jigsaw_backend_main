import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSignUpLink1750148243067 implements MigrationInterface {
  name = 'UserSignUpLink1750148243067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_signup_link" ("id" SERIAL NOT NULL, "email" character varying(255), "role" character varying(255) NOT NULL, "token" character varying(255) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "created_by_id" integer NOT NULL, "used_by_id" integer, CONSTRAINT "UQ_206a4886b0d18a9d9f99a04fefa" UNIQUE ("token"), CONSTRAINT "PK_02c3b432cb92726ccd3f9181ef7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-signup-link-token" ON "user_signup_link" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-signup-link-created-by-id" ON "user_signup_link" ("created_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-signup-link-used-by-id" ON "user_signup_link" ("used_by_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_signup_link" ADD CONSTRAINT "FK_9c305b042a2c666c4a3c7598280" FOREIGN KEY ("created_by_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_signup_link" ADD CONSTRAINT "FK_7a0da3b61f9991df86802e2dc1d" FOREIGN KEY ("used_by_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_signup_link" DROP CONSTRAINT "FK_7a0da3b61f9991df86802e2dc1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_signup_link" DROP CONSTRAINT "FK_9c305b042a2c666c4a3c7598280"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-user-signup-link-used-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-user-signup-link-created-by-id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx-user-signup-link-token"`);
    await queryRunner.query(`DROP TABLE "user_signup_link"`);
  }
}
