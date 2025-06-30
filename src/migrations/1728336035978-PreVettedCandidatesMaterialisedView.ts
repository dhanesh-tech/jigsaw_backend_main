import { MigrationInterface, QueryRunner } from 'typeorm';

export class PreVettedCandidatesMaterialisedView1728336035978
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW prevetted_candidates_materialized_view AS
      SELECT DISTINCT 
        prevetted_candidates.id as candidate_id,
        prevetted_candidates.full_name as full_name,
        prevetted_candidates.hash_id as hash_id,
        prevetted_candidates.is_active as is_active
      FROM (
        -- Select candidates from assigned assessment kits who are shortlisted but not referred by HM
        SELECT 
          candidate.id,
        candidate.full_name,
        candidate.hash_id,
        candidate.is_active
        FROM 
          assigned_assessment_kit assigned_kits
        JOIN 
          users_customuser candidate ON assigned_kits.candidate_id = candidate.id
        JOIN 
          referral_invite ref_invite ON assigned_kits.candidate_id = ref_invite.accepted_by
        JOIN 
          users_customuser referred_by_user ON ref_invite.referred_by = referred_by_user.id
        WHERE 
          assigned_kits.status = 'shortlisted'
         AND candidate.is_active = true
         AND referred_by_user.role <> 'hiring_manager'

        UNION

        -- Select candidates from job applications who are rejected and referred by same job poster
        SELECT 
          candidate.id,
        candidate.full_name,
        candidate.hash_id,
        candidate.is_active
        FROM 
          job_application job_application
        JOIN 
          users_customuser candidate ON job_application.candidate_id = candidate.id
        JOIN 
          job_requirements job_requirement ON job_application.jobrequirement_id = job_requirement.id
        JOIN 
          referral_invite ref_invite ON job_application.candidate_id = ref_invite.accepted_by
        WHERE 
          job_application.application_status IN ('rejected')
          AND ref_invite.referred_by = job_requirement.posted_by_id
          AND candidate.is_active = true
      )
      AS prevetted_candidates;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP MATERIALIZED VIEW prevetted_candidates_materialized_view`,
    );
  }
}
