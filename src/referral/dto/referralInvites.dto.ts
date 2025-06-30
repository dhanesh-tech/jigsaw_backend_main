import { PartialType } from '@nestjs/mapped-types';
import { REFERRAL_INVITE_STATUS } from '../utilities/enum';
import { IsEmail, IsString, Matches } from 'class-validator';

export class CreateReferralInviteDto {
  @IsEmail({}, { message: 'Invalid email address' })
  user_email: string;
  status: REFERRAL_INVITE_STATUS;
  accepted_by_id: number;
  referral_code: string;
  video_asset_id: string;
  video_playback_id: string;
  @IsString({ message: 'LinkedIn URL must be a string' })
  @Matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+$/, {
    message: 'Invalid LinkedIn profile URL format',
  })
  user_linkedin_url: string;
  user_name: string;
  notes: string;
  job_id?: number;
}

export class UpdateReferralInviteDto extends PartialType(
  CreateReferralInviteDto,
) {}
