import Mux from '@mux/mux-node';

export class MuxResponseDto {
  video_asset_id: string;
  video_playback_id: string;
}

export interface UploadCreateDto extends Mux.Video.Uploads {}

export interface UploadRetrieveDto extends Mux.Video.Upload {}

export interface PlaybackIDsDto extends Mux.Video.Asset {}
