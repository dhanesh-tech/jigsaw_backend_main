import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserTimezoneConstants } from 'src/_jigsaw/enums';

/**
 * Data Transfer Object (DTO) for User.
 */
export class UserDto {
  @IsString()
  full_name: string;
  @IsBoolean()
  is_active: boolean;
  @IsBoolean()
  is_verified: boolean;

  @IsEnum(UserTimezoneConstants)
  timezone: UserTimezoneConstants;
}

/**
 * Data Transfer Object for user referral code.
 */
export class UserReferralCodeDto {
  referral_code: string;
  hash_id: string;
}

export class UpdateUserDto extends PartialType(UserDto) {}
