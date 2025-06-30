import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  INTERVIEW_ASSET_TRANSCRIPTION_STARTED_EVENT,
  ASSESSMENT_ASSET_TRANSCRIPTION_STARTED_EVENT,
} from 'src/_jigsaw/eventSignalConstants';
import { AiTranscriptionCompleteDto } from 'src/ai/dto/aiTranscriptionComplete.dto';
import { ERROR_HANDLING_EVENT } from 'src/_jigsaw/constants';
import { AwsService } from 'src/aws/aws.service';
@Injectable()
export class TranscriptionEventsListener {
  constructor(
    private readonly logger: Logger,
    private readonly awsService: AwsService,
  ) {}

  /**
   * Handles the event when a transcription is started.
   * @param data - The data containing the transcription details.
   * @description Starts a transcription job on the AI backend.
   *
   */
  @OnEvent(INTERVIEW_ASSET_TRANSCRIPTION_STARTED_EVENT)
  async handleInterviewAssetTranscriptionStartedEvent(
    data: AiTranscriptionCompleteDto,
  ) {
    try {
      const { interview_id, asset_video_url } = data;
      this.logger.log('Interview Transcription event received:', data);
      // trigger transcription job on the AI backend
      if (interview_id && asset_video_url) {
        await this.awsService.sendMessageToSqs(data);
      }
    } catch (error) {
      throw new Error(
        `${ERROR_HANDLING_EVENT},
        ${INTERVIEW_ASSET_TRANSCRIPTION_STARTED_EVENT}, ${error}`,
      );
    }
  }

  @OnEvent(ASSESSMENT_ASSET_TRANSCRIPTION_STARTED_EVENT)
  async handleAssessmentAssetTranscriptionStartedEvent(
    data: AiTranscriptionCompleteDto,
  ) {
    try {
      this.logger.log('Assessment Transcription event received:', data);
      // trigger transcription job on the AI backend
      const { assessment_response_id, asset_video_url } = data;
      if (assessment_response_id && asset_video_url) {
        await this.awsService.sendMessageToSqs(data);
      }
    } catch (error) {
      throw new Error(
        `${ERROR_HANDLING_EVENT},
        ${ASSESSMENT_ASSET_TRANSCRIPTION_STARTED_EVENT}`,
      );
    }
  }
}
