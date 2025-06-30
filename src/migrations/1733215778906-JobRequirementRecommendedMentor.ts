import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobRequirementRecommendedMentor1733215778906
  implements MigrationInterface
{
  name = 'JobRequirementRecommendedMentor1733215778906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "jobrequirement_recommended_mentor" ("id" SERIAL NOT NULL, "score" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "jobrequirement_id" integer, "mentor_id" integer, CONSTRAINT "PK_1155483a932aad4571d81199fc0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-jobrequirement-recommended-mentor-jobrequirement-id" ON "jobrequirement_recommended_mentor" ("jobrequirement_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_mentor" ADD CONSTRAINT "FK_faf34e3314f2840e6cbbc115b32" FOREIGN KEY ("jobrequirement_id") REFERENCES "job_requirements"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_mentor" ADD CONSTRAINT "FK_426af0f19957c0acbc1538b97c7" FOREIGN KEY ("mentor_id") REFERENCES "users_customuser"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_mentor" DROP CONSTRAINT "FK_426af0f19957c0acbc1538b97c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobrequirement_recommended_mentor" DROP CONSTRAINT "FK_faf34e3314f2840e6cbbc115b32"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-jobrequirement-recommended-mentor-jobrequirement-id"`,
    );
    await queryRunner.query(`DROP TABLE "jobrequirement_recommended_mentor"`);
  }
}
