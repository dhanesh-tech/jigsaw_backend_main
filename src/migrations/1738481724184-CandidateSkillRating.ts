import { MigrationInterface, QueryRunner } from 'typeorm';

export class CandidateSkillRating1738481724184 implements MigrationInterface {
  name = 'CandidateSkillRating1738481724184';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "candidate_skill_rating" ("id" SERIAL NOT NULL, "additional_comments" text, "rating_value" numeric NOT NULL, "is_ai_generated" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "skill_id" integer, "candidate_id" integer, "rated_by_id" integer, CONSTRAINT "UQ_df90ec1a2a2c868695735d10889" UNIQUE ("candidate_id", "skill_id", "rated_by_id"), CONSTRAINT "PK_b72da988e9535b9cbc841342c8f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-candidate-skill-rating-skill-id" ON "candidate_skill_rating" ("skill_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-candidate-skill-rating-candidate-id" ON "candidate_skill_rating" ("candidate_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-candidate-skill-rating-rated-by-id" ON "candidate_skill_rating" ("rated_by_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skill_rating" ADD CONSTRAINT "FK_c0fbaddb315cc2e8526ade34a09" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skill_rating" ADD CONSTRAINT "FK_32996b750257b6559136017869e" FOREIGN KEY ("candidate_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skill_rating" ADD CONSTRAINT "FK_407f70d3954944433a6ecfa5ca2" FOREIGN KEY ("rated_by_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "candidate_skill_rating" DROP CONSTRAINT "FK_407f70d3954944433a6ecfa5ca2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skill_rating" DROP CONSTRAINT "FK_32996b750257b6559136017869e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_skill_rating" DROP CONSTRAINT "FK_c0fbaddb315cc2e8526ade34a09"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-candidate-skill-rating-rated-by-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-candidate-skill-rating-candidate-id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx-candidate-skill-rating-skill-id"`,
    );
    await queryRunner.query(`DROP TABLE "candidate_skill_rating"`);
  }
}
