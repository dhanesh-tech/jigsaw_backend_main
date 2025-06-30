import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignedAssessmentKit1720792263702 implements MigrationInterface {
  name = 'AssignedAssessmentKit1720792263702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."assigned_assessment_kit_status_enum" AS ENUM('assigned', 'pending', 'accepted', 'declined', 'rejected', 'shortlisted', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "assigned_assessment_kit" ("id" SERIAL NOT NULL, "remark_by_reviewee" character varying, "remark_by_assignee" character varying, "status" "public"."assigned_assessment_kit_status_enum" NOT NULL DEFAULT 'assigned', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "assessment_id" integer, "candidate_id" integer, "assigned_by_id" integer, "reviewed_by_id" integer, CONSTRAINT "uq_assigned_assessment_kit_assessment_id_candidate_id" UNIQUE ("assessment_id", "candidate_id"), CONSTRAINT "pk_assigned_assessment_kit" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assigned-assessment-kit-status" ON "assigned_assessment_kit" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assigned-assessment-kit-assessment-id" ON "assigned_assessment_kit" ("assessment_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assigned-assessment-kit-candidate-id" ON "assigned_assessment_kit" ("candidate_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-assigned-assessment-kit-reviewed-by-id" ON "assigned_assessment_kit" ("reviewed_by_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "fk_assigned_assessment_kit_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_kit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "fk_assigned_assessment_kit_candidate_id" FOREIGN KEY ("candidate_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "fk_assigned_assessment_kit_assigned_by_id" FOREIGN KEY ("assigned_by_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" ADD CONSTRAINT "fk_assigned_assessment_kit_reviewed_by_id" FOREIGN KEY ("reviewed_by_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "fk_assigned_assessment_kit_reviewed_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "fk_assigned_assessment_kit_assigned_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "fk_assigned_assessment_kit_candidate_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_assessment_kit" DROP CONSTRAINT "fk_assigned_assessment_kit_assessment_id"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."idx-assigned-assessment-kit-reviewed-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assigned-assessment-kit-candidate-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assigned-assessment-kit-assessment-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-assigned-assessment-kit-status"`,
    );
    await queryRunner.query(`DROP TABLE "assigned_assessment_kit"`);
    await queryRunner.query(
      `DROP TYPE "public"."assigned_assessment_kit_status_enum"`,
    );
  }
}
