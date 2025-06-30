import { MigrationInterface, QueryRunner } from 'typeorm';

export class SkillTopic1720730465800 implements MigrationInterface {
  name = 'SkillTopic1720730465800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "skill_topic" ("id" SERIAL NOT NULL, "topic_name" character varying NOT NULL, "serial_number" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "skill_id" integer, CONSTRAINT "pk_skill_topic_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_topic" ADD CONSTRAINT "fk_topic_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx-topic-skill" ON "skill_topic" ("skill_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "skill_topic" DROP CONSTRAINT "fk_topic_skill_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx-topic-skill"`);
    await queryRunner.query(`DROP TABLE "skill_topic"`);
  }
}
