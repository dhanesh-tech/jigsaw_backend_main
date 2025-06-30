import { IsEnum, IsNumber, IsString, IsUrl, Matches } from 'class-validator';
import { Country } from 'src/master/entities/country.entity';
import { PartialType } from '@nestjs/mapped-types';
import { GENDER } from '../utilities/enum';

/**
 * Data Transfer Object for user meta information.
 * - phone: string - The phone number of the user e.g. '+1234567890'.
 */
export class UserMetaInfoDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number is not valid' })
  phone: string;

  @IsUrl()
  linkedin_url: string;

  is_currently_working?: boolean;

  @IsEnum(GENDER)
  gender: GENDER;

  headline: string;

  is_active: boolean;

  @IsNumber()
  country_id: Country;
}

export class UpdateUserMetaInfoDto extends PartialType(UserMetaInfoDto) {}
