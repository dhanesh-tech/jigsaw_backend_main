import { MigrationInterface, QueryRunner } from 'typeorm';

export class Company1732192898182 implements MigrationInterface {
  name = 'Company1732192898182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying, "contact_phone" character varying, "support_email" character varying, "domain_url" character varying NOT NULL, "hash_id" character varying(20) NOT NULL, "is_verified" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "admin_id" integer, CONSTRAINT "UQ_3e656677e776a7f68fe63c47260" UNIQUE ("hash_id"), CONSTRAINT "UQ_2ed87545c666c7bbf4b65d4d397" UNIQUE ("domain_url"), CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-company-hash-id" ON "company" ("hash_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD CONSTRAINT "FK_907043fa6fbb112b5767e3719db" FOREIGN KEY ("admin_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company" DROP CONSTRAINT "FK_907043fa6fbb112b5767e3719db"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx-company-hash-id"`);
    await queryRunner.query(`DROP TABLE "company"`);
  }
}
