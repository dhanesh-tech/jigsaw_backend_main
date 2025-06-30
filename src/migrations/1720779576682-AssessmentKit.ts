import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentKit1720779576682 implements MigrationInterface {
  name = 'AssessmentKit1720779576682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."assessment_kit_status_enum" AS ENUM('draft', 'publish', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "assessment_kit" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "hash_id" character varying NOT NULL, "additional_notes" character varying, "total_questions" integer NOT NULL, "status" "public"."assessment_kit_status_enum" NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "created_by" integer NOT NULL, CONSTRAINT "uq_assessment_hash_id" UNIQUE ("hash_id"), CONSTRAINT "pk_assessment_kit_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assesssment-kit-hash-id" ON "assessment_kit" ("hash_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assesssment-kit-status" ON "assessment_kit" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assesssment-kit-created-by-id" ON "assessment_kit" ("created_by") `,
    );
    await queryRunner.query(
      `ALTER TABLE "assessment_kit" ADD CONSTRAINT "fk_assessment_created_by_id" FOREIGN KEY ("created_by") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assessment_kit" DROP CONSTRAINT "fk_assessment_created_by_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assesssment-kit-created-by-id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx-assesssment-kit-status"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx-assesssment-kit-hash-id"`,
    );
    await queryRunner.query(`DROP TABLE "assessment_kit"`);
    await queryRunner.query(`DROP TYPE "public"."assessment_kit_status_enum"`);
  }
}
