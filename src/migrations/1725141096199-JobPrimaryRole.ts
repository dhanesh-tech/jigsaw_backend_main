import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobPrimaryRole1725141096199 implements MigrationInterface {
  name = 'JobPrimaryRole1725141096199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."job_primary_role_department_enum" AS ENUM('it', 'management', 'operations', 'designer', 'sales', 'marketing')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_primary_role" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "department" "public"."job_primary_role_department_enum" NOT NULL, CONSTRAINT "PK_970d1a6944f38c4c54f738138eb" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "job_primary_role"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_primary_role_department_enum"`,
    );
  }
}
