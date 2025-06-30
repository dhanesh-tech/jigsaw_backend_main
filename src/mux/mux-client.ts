import { Injectable, Logger } from '@nestjs/common';
import Mux from '@mux/mux-node';
import {
  FRONTEND_URL,
  MUX_TOKEN_ID,
  MUX_TOKEN_SECRET,
  MUX_WEBHOOK_SIGNING_SECRET,
} from 'src/_jigsaw/envDefaults';
import {
  PlaybackIDsDto,
  UploadCreateDto,
  UploadRetrieveDto,
} from './dto/mux-response.dto';
import {
  MUX_ENCODING_TIER,
  MUX_MAX_RESOLUTION_TIER,
  MUX_MP4_SUPPORT,
  MUX_PLAYBACK_POLICY,
  MUX_VIDEO_QUALITY,
  MUX_MASTER_ACCESS,
} from './utilities/constants';

@Injectable()
export class MuxClient {
  private mux: any = new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET,
  });
  private logger: Logger;
  constructor() {}

  /**
   * Creates a signed URL for uploading a video to Mux.
   *
   * This method generates a signed URL that can be used to upload a video to Mux with specific settings.
   * The video will have public playback policy, a maximum resolution of 1080p, smart encoding tier,
   * standard MP4 support, and generated subtitles in English.
   *
   * @returns {Promise<UploadCreateDto>} A promise that resolves to an UploadCreateDto containing the signed URL.
   */
  async createSignedUrl(): Promise<UploadCreateDto> {
    const signedUrl: UploadCreateDto = await this.mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: MUX_PLAYBACK_POLICY,
        max_resolution_tier: MUX_MAX_RESOLUTION_TIER,
        encoding_tier: MUX_ENCODING_TIER,
        mp4_support: MUX_MP4_SUPPORT,
        master_access: MUX_MASTER_ACCESS,
      },
      cors_origin: FRONTEND_URL,
    });

    return signedUrl;
  }

  /**
   * Retrieves the Mux asset details for a given upload ID.
   *
   * @param upload_id - The ID of the upload to retrieve the asset details for.
   * @returns A promise that resolves to an UploadRetrieveDto containing the asset details.
   */
  async getMuxAssetId(upload_id: string): Promise<UploadRetrieveDto> {
    const assetDetails: UploadRetrieveDto =
      await this.mux.video.uploads.retrieve(upload_id);
    return assetDetails;
  }

  /**
   * Retrieves the playback details for a given asset ID from Mux.
   *
   * @param asset_id - The ID of the asset for which to retrieve playback details.
   * @returns A promise that resolves to a `PlaybackIDsDto` containing the playback details.
   */
  async getMuxPlayBackId(asset_id: string): Promise<PlaybackIDsDto> {
    const playbackDetails: PlaybackIDsDto =
      await this.mux.video.assets.retrieve(asset_id);

    return playbackDetails;
  }

  /**
   * Creates a new Mux asset using the provided signed URL.
   *
   * @param assetSignedUrl - The signed URL of the asset to be uploaded.
   * @returns A promise that resolves to an UploadCreateDto object containing the details of the created asset.
   *
   * The created asset will have the following settings:
   */
  async createMuxAsset(assetSignedUrl: string): Promise<any> {
    const savedAsset = await this.mux.video.assets.create({
      playback_policy: MUX_PLAYBACK_POLICY,
      max_resolution_tier: MUX_MAX_RESOLUTION_TIER,
      video_quality: MUX_VIDEO_QUALITY,
      master_access: MUX_MASTER_ACCESS,
      input: [
        {
          url: assetSignedUrl,
        },
      ],
    });

    return savedAsset;
  }

  /**
   * Verifies the webhook signature for a given payload and signature.
   *
   * @param body - The payload to verify.
   * @param headers - The signature to verify.
   * @returns {boolean} True if the signature is valid, false otherwise.
   */
  async verifyWebhookSignature(body: string, headers: Headers): Promise<void> {
    await this.mux.webhooks.verifySignature(
      body,
      headers,
      MUX_WEBHOOK_SIGNING_SECRET,
    );
    return;
  }
}
