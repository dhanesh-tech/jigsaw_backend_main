import { IsOptional } from 'class-validator';

export class ReferralQueryDto {
  @IsOptional()
  status: string;

  @IsOptional()
  referred_by_id: number;
}
