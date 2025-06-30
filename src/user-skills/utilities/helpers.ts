export const refreshSkillRatingMaterializedViewQuery = `REFRESH MATERIALIZED VIEW user_skill_rating_materialised_view`;

// query to get all skills for a user
export const getUserSkillsQuery = (candidate_id: number): string =>
  `SELECT * FROM public.user_skills WHERE user_id = ${candidate_id} order by created_at desc`;
