import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MuxService } from './mux.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UploadCreateDto, MuxResponseDto } from './dto/mux-response.dto';

@Controller('/v1/mux')
export class MuxController {
  constructor(private readonly muxService: MuxService) {}

  /**
   * Creates a signed URL using the Mux service.
   *
   * /v1/mux/signed-url/
   * @returns {Promise<UploadCreateDto>} A promise that resolves to the signed URL.
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate, USER_ROLE.mentor)
  @Get('/signed-url/')
  async createSignedUrl(): Promise<UploadCreateDto> {
    return this.muxService.createSignedUrl();
  }

  /**
   * Retrieves the playback ID and asset ID from a signed URL.
   *
   * /v1/mux/playback-asset-ids/:unique_id
   * @returns {Promise<MuxResponseDto>} A promise that resolves to an object containing the playback ID and asset ID.
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate, USER_ROLE.mentor)
  @Get('/playback-asset-ids/:unique_id')
  async getPlaybackAssetIds(
    @Param('unique_id') uploadId: string,
  ): Promise<MuxResponseDto> {
    return this.muxService.getPlaybackAssetIds(uploadId);
  }
}
