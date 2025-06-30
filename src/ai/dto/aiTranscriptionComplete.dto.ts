/**
 * Data Transfer Object for AI Transcription Completion
 *
 * @property {string} asset_id - The identifier for the associated asset.
 * @property {string} [interview_id] - The identifier for the associated interview (optional).
 * @property {string} [assessment_response_id] - The identifier for the associated assessment (optional).
 * @property {boolean} is_completed - Indicates whether the transcription process is completed.
 */
export class AiTranscriptionCompleteDto {
  asset_id: string;
  interview_id?: number;
  assessment_response_id?: number;
  is_completed: boolean;
  asset_video_url?: string;
}
