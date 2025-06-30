import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { dehashUrl } from '../utilities/hashing';
import { Transform, Type } from 'class-transformer';
import { LENGTH_SHOULD_NOT_BE_EMPTY } from '../../_jigsaw/constants';
import { ProfileExtractionStatus } from '../utilities/enums';

export class ExtractedProfileUrlsDto {
  @IsString()
  @IsOptional()
  user_id: string;

  @IsString()
  @IsNotEmpty({ message: LENGTH_SHOULD_NOT_BE_EMPTY('user_url') })
  @Transform(({ value }) => {
    const transformed = dehashUrl(value);
    return transformed;
  })
  user_url: string;

  @IsString()
  @IsNotEmpty({ message: LENGTH_SHOULD_NOT_BE_EMPTY('extracted_url') })
  @Transform(({ value }) => {
    const transformed = dehashUrl(value);
    return transformed;
  })
  extracted_url: string;

  @IsString()
  @IsNotEmpty({ message: LENGTH_SHOULD_NOT_BE_EMPTY('platform') })
  platform: string;

  @IsEnum(ProfileExtractionStatus)
  @IsOptional()
  status: ProfileExtractionStatus;
}

export class ExtractedProfileUrlsDtoWrapper {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtractedProfileUrlsDto)
  urls: ExtractedProfileUrlsDto[];
}
