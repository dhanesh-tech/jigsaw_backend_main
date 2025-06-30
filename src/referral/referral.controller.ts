import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateReferralInviteDto } from './dto/referralInvites.dto';
import { REFERRAL_INVITE_STATUS } from './utilities/enum';
import { STATUS_NOT_VALID } from 'src/_jigsaw/constants';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { USER_ROLE } from 'src/users/utilities/enum';

@Controller('v1/referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  /**
   * v1/referral/email-invite
   * send referral email invite
   * @body {string} user_email - The email of user being invited.
   * @throws {HttpException} - If email is not valid.
   */
  @Post('/email-invite')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  createEmailInvite(
    @Req() req: any,
    @Body() referralDto: UpdateReferralInviteDto,
  ) {
    const user_id = req?.user?.id;
    return this.referralService.inviteViaEmail(
      referralDto,
      +user_id,
      req?.user,
    );
  }

  /**
   * v1/referral/:referral_uuid
   * validate referral invite received on email
   * @param id
   * @body  accepted_by_id, status - User either accepts or declines
   * @throws {HttpException} - if referral_uuid is not valid
   */
  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  validateReferralInvite(
    @Req() req: any,
    @Body() referralDto: UpdateReferralInviteDto,
    @Param('id') id: number,
  ) {
    const user_id = req?.user?.id;

    return this.referralService.validateReferralInvite(
      +id,
      referralDto,
      user_id,
    );
  }

  /**
   * v1/referral/:referral_uuid
   * validate referral invite received on email
   * @param referral_uuid
   * @body  accepted_by_id, status - User either accepts or declines
   * @throws {HttpException} - if referral_uuid is not valid
   */
  @Get('/:referral_uuid')
  getReferralInvite(@Param('referral_uuid') referral_uuid: string) {
    return this.referralService.getReferralInvite(referral_uuid);
  }

  /**
   * v1/referral/accept-referral
   * user accepting through referral code
   * @body {referral_code } user accepting through referral code
   * @throws {HttpException} - if referral code is not valid.
   */
  @Post('/accept-referral')
  @UseGuards(JwtAuthGuard)
  acceptNewReferralInvite(
    @Req() req: any,
    @Body() referralDto: UpdateReferralInviteDto,
  ) {
    const user_id = req?.user?.id;
    return this.referralService.acceptReferralInvite(referralDto, +user_id);
  }

  /**
   * v1/referral/invited/all
   * lists of all referrals sent by user
   * @param status
   * @throws {HttpException} - If status is not valid.
   */
  @Get('/invited/all')
  @UseGuards(JwtAuthGuard)
  allReferralInvites(@Req() req: any, @Query('status') status: string) {
    const user_id = req?.user?.id;
    // check status belongs to enum and then, throw error
    if (status) {
      status = status.toLowerCase();
      if (!(status in REFERRAL_INVITE_STATUS)) {
        throw new HttpException(STATUS_NOT_VALID, 400);
      }
    }
    return this.referralService.allReferralInvites(+user_id, status);
  }

  /**
   * @method validateReferralCode
   * @async
   * @param {string} code - The referral code to be validated.
   *
   * @example
   *  GET /v1/referral/validate-code/:referral_code
   */
  @Get('/validate-code/:referral_code')
  @UseGuards(PublicAuthGuard)
  async validateReferralCode(@Param('referral_code') code: string) {
    return await this.referralService.validateReferralCode(code);
  }

  /**
   * v1/referral/status/count
   * get the count of referrals sent by user
   * @throws {HttpException} - If user is not authenticated.
   */
  @Get('/status/count')
  @UseGuards(JwtAuthGuard)
  getReferralCount(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.referralService.getReferralCount(+user_id);
  }

  /**
   * Validates a candidate referral invite.
   * /v1/referral/validate-candidate-referral/:id
   * @param req - The request object containing user information.
   * @param id - The ID of the referral invite to be validated.
   * @param referralDto - The data transfer object containing the referral invite details.
   * @returns A promise that resolves with the validation result.
   */
  @Put('/validate-candidate-referral/:id')
  @UseGuards(JwtAuthGuard)
  validateCandidateReferralInvite(
    @Req() req: any,
    @Param('id') id: string,
    @Body() referralDto: UpdateReferralInviteDto,
  ) {
    const user_id = req?.user?.id;
    return this.referralService.validateCandidateReferralInvite(
      +id,
      referralDto,
      +user_id,
    );
  }

  /**
   * v1/referral/testimonial
   * upload testimonial video and notes
   * @body {testimonial_video_asset_id, testimonial_video_playback_id, testimonial_notes}
   * @throws {HttpException} - If testimonial video is not valid.
   */
  @Post('/testimonial')
  @UseGuards(JwtAuthGuard)
  @UserRole(USER_ROLE.mentor)
  createReferralTestimonial(
    @Req() req: any,
    @Body() testimonialDto: UpdateReferralInviteDto,
  ) {
    const user_id = req?.user?.id;
    return this.referralService.createReferralTestimonial(
      testimonialDto,
      +user_id,
    );
  }

  /**
   * v1/referral/testimonial/:id
   *
   * @body - UpdateReferralInviteDto
   * @throws {HttpException} - If testimonial video is not valid.
   */
  @Put('/testimonial/:id')
  @UseGuards(JwtAuthGuard)
  @UserRole(USER_ROLE.mentor)
  updateReferralTestimonial(
    @Req() req: any,
    @Param('id') id: string,
    @Body() testimonialDto: UpdateReferralInviteDto,
  ) {
    const user_id = req?.user?.id;
    return this.referralService.updateReferralTestimonial(
      +id,
      testimonialDto,
      +user_id,
    );
  }

  /**
   * v1/referral/referral-details/:uuid
   * get testimonial details
   * @throws {HttpException} - If testimonial video is not valid.
   */
  @Get('/referral-details/:uuid')
  @UseGuards(PublicAuthGuard)
  getReferralTestimonialPublicDetails(
    @Param('uuid') uuid: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.referralService.getReferralTestimonialPublicDetails(
      uuid,
      user_id,
    );
  }
}
