import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSkills1725613880393 implements MigrationInterface {
  name = 'UserSkills1725613880393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_skills" ("id" SERIAL NOT NULL, "self_rating_value" integer NOT NULL, "experience_level" "public"."skill_difficulty_level_enum" NOT NULL DEFAULT 'beginner', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "skill_id" integer, "user_id" integer, CONSTRAINT "UQ_816eba68a0ca1b837ec15daefc7" UNIQUE ("user_id", "skill_id"), CONSTRAINT "PK_4d0a72117fbf387752dbc8506af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-skills-skill-id" ON "user_skills" ("skill_id") `,
    );

    await queryRunner.query(
      `CREATE INDEX "idx-user-skills-user-id" ON "user_skills" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-user-skills-experience-level" ON "user_skills" ("experience_level") `,
    );

    await queryRunner.query(
      `ALTER TABLE "user_skills" ADD CONSTRAINT "FK_eb69710b0a00f42fb95fc2ac2f5" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_skills" ADD CONSTRAINT "FK_6926002c360291df66bb2c5fdeb" FOREIGN KEY ("user_id") REFERENCES "users_customuser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_skills" DROP CONSTRAINT "FK_6926002c360291df66bb2c5fdeb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_skills" DROP CONSTRAINT "FK_eb69710b0a00f42fb95fc2ac2f5"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."idx-user-skills-experience-level"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx-user-skills-user-id"`);
    await queryRunner.query(`DROP INDEX "public"."idx-user-skills-skill-id"`);
    await queryRunner.query(`DROP TABLE "user_skills"`);
  }
}
