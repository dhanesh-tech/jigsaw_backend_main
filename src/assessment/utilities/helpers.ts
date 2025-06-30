import { v4 as uuidv4 } from 'uuid';

export function generateAssessmentHashId(): string {
  return uuidv4();
}

// query to get status count on an assessment kit
export async function getAssignedAssessmentCountByStatusQuery(
  assessment_id: number,
): Promise<string> {
  return await `SELECT status, COUNT(*) AS count FROM assigned_assessment_kit 
  WHERE assessment_id=${assessment_id} GROUP BY status;`;
}
