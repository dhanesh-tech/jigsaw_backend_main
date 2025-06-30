import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyIndustry1725014135246 implements MigrationInterface {
  name = 'CompanyIndustry1725014135246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "company_industries" (
                    "id" SERIAL NOT NULL,
                    "name" character varying(255) NOT NULL,
                    CONSTRAINT "pk_company_industries_id" PRIMARY KEY ("id")
                )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop company_industries table
    await queryRunner.query(`DROP TABLE "company_industries"`);
  }
}
