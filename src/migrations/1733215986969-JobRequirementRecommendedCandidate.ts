import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobRequirementRecommendedCandidate1733215986969
  implements MigrationInterface
{
  name = 'JobRequirementRecommendedCandidate1733215986969';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "jobrequirement_recommended_candidate" ("id" SERIAL NOT NULL, "score" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "jobrequirement_id" integer, "candidate_id" integer, CONSTRAINT "PK_77b5464e6b54c0c5a497991776a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-jobrequirement-recommended-candidate-jobrequirement-id" ON "jobrequirement_recommended_candidate" ("jobrequirement_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_candidate" ADD CONSTRAINT "FK_0e069e8e855e40a1b65b9728ed4" FOREIGN KEY ("jobrequirement_id") REFERENCES "job_requirements"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_candidate" ADD CONSTRAINT "FK_5a44f3431466975fd379f8c624c" FOREIGN KEY ("candidate_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_candidate" DROP CONSTRAINT "FK_5a44f3431466975fd379f8c624c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_candidate" DROP CONSTRAINT "FK_0e069e8e855e40a1b65b9728ed4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-jobrequirement-recommended-candidate-jobrequirement-id"`,
    );
    await queryRunner.query(
      `DROP TABLE "jobrequirement_recommended_candidate"`,
    );
  }
}
