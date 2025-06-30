import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { UserSkills } from 'src/user-skills/entities/userSkill.entity';
import { ViewEntity, ViewColumn, OneToMany, PrimaryColumn } from 'typeorm';

@ViewEntity({
  name: 'prevetted_candidates_materialized_view',
  expression: `SELECT DISTINCT 
        prevetted_candidates.id,
        prevetted_candidates.full_name as full_name,
        prevetted_candidates.hash_id as hash_id,
        prevetted_candidates.is_active as is_active
      FROM (
       -- Select all candidates who have a rating of 3 or more in at least one skill 
        SELECT 
          candidate.id,
          candidate.full_name,
          candidate.hash_id,
          candidate.is_active
        FROM 
          user_skills candidate_skill
        JOIN 
          users_customuser candidate ON candidate_skill.user_id = candidate.id
        
        WHERE 
         candidate_skill.evaluated_rating_value >= 3
         AND candidate.is_active = true
         AND (
            SELECT COUNT(*) 
            FROM assessment_candidate_question_response AS response
            WHERE response.candidate_id = candidate.id
            AND response.status = 'answered'
            ) > 5
      )
      AS prevetted_candidates;`,
})
export class PrevettedCandidatesView {
  @PrimaryColumn()
  candidate_id: number;

  @ViewColumn()
  full_name: string;

  @ViewColumn()
  hash_id: string;

  @ViewColumn()
  is_active: boolean;

  @OneToMany(() => UserSkills, (userSkill) => userSkill.user_id)
  skills: UserSkills[];

  /**
   * A one-to-many relationship between the JobApplication entity and the AssignedAssessmentKit entity.
   */
  @OneToMany(
    () => AssignedAssessmentKit,
    (assignedAssessmentKit) => assignedAssessmentKit.candidate_id,
  )
  assessments: AssignedAssessmentKit[];
}
