/**
 * Data Transfer Object (DTO) for transcription started events.
 */
export class TranscriptionStartedDto {
  asset_id: string;
  asset_video_url: string;
  interview_id?: string;
  assessment_id?: string;
}
