import { Injectable } from '@nestjs/common';
import { MuxClient } from './mux-client';
import { UploadCreateDto, MuxResponseDto } from './dto/mux-response.dto';
import { MUX_ASSET_MASTER_ACCESS_READY } from './utilities/constants';
import {
  ASSESSMENT_ASSET_TRANSCRIPTION_STARTED_EVENT,
  INTERVIEW_ASSET_TRANSCRIPTION_STARTED_EVENT,
} from 'src/_jigsaw/eventSignalConstants';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class MuxService {
  constructor(
    private readonly muxClient: MuxClient,
    private readonly eventEmitter: EventEmitter,
    private readonly aiService: AiService,
  ) {}

  /**
   * Creates a signed URL using the Mux client.
   *
   * @returns {Promise<UploadCreateDto>} A promise that resolves to an UploadCreateDto object containing the signed URL.
   */
  async createSignedUrl(): Promise<UploadCreateDto> {
    const signedUrl = await this.muxClient.createSignedUrl();
    return signedUrl;
  }

  /**
   * Retrieves the playback asset IDs from a unique upload id.
   *
   * @param unique_id - The unique id to get the asset details from.
   * @returns A promise that resolves to a MuxResponseDto containing the video asset ID and video playback ID.
   */
  async getPlaybackAssetIds(unique_id: string): Promise<MuxResponseDto> {
    const assetDetails = await this.muxClient.getMuxAssetId(unique_id);

    const asset_id = assetDetails.asset_id;

    const playbackDetails = await this.muxClient.getMuxPlayBackId(asset_id);

    const muxResponse: MuxResponseDto = {
      video_asset_id: asset_id,
      video_playback_id: playbackDetails.playback_ids[0].id,
    };

    return muxResponse;
  }

  /**
   * Uploads an HMS recording to Mux and retrieves the playback details.
   *
   * @param signedUrl - The signed URL of the HMS recording to be uploaded.
   * @returns {Promise<MuxResponseDto> }- A promise that resolves to a MuxResponseDto containing the video asset ID and playback ID.
   */
  async uploadHmsRecording(signedUrl: string): Promise<any> {
    const assetDetails = await this.muxClient.createMuxAsset(signedUrl);
    const asset_id = assetDetails.id;

    const playbackDetails = await this.muxClient.getMuxPlayBackId(asset_id);

    const muxResponse: MuxResponseDto = {
      video_asset_id: asset_id,
      video_playback_id: playbackDetails.playback_ids[0].id,
    };

    return muxResponse;
  }

  /**
   * Handles the webhook from Mux for asset events.
   *
   * @param body - The payload to verify.
   * @param headers - The signature to verify.
   * @returns {Promise<void>} A promise that resolves when the webhook is processed.
   */
  async handleMuxAssetsWebhook(body: any, headers: Headers): Promise<void> {
    // parse the body as json string for webhook signature verification
    const bodyString = JSON.stringify(body);
    this.muxClient.verifyWebhookSignature(bodyString, headers);

    if (body.type === MUX_ASSET_MASTER_ACCESS_READY) {
      const asset_id = body.data.id;
      const asset_video_url = body.data.master.url;

      // check if the asset is already transcribed
      const assetTranscription =
        await this.aiService.findAiTranscriptionByAssetId(asset_id);

      if (assetTranscription.is_completed) {
        return;
      }

      if (assetTranscription.assessment_response_id) {
        // find the assessment response
        this.eventEmitter.emit(ASSESSMENT_ASSET_TRANSCRIPTION_STARTED_EVENT, {
          asset_id,
          asset_video_url,
          assessment_response_id: assetTranscription.assessment_response_id,
        });
        return;
      }

      if (assetTranscription.interview_id) {
        // find the interview
        this.eventEmitter.emit(INTERVIEW_ASSET_TRANSCRIPTION_STARTED_EVENT, {
          asset_id,
          asset_video_url,
          interview_id: assetTranscription.interview_id,
        });
        return;
      }
    }

    return;
  }
}
