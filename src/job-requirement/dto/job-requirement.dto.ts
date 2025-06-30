import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import {
  EmploymentType,
  Experience,
  ExpertiseLevel,
  JobPostStatus,
  PaymentType,
  CurrencyChoices,
} from '../utilities/enum';
import { Country } from 'src/master/entities/country.entity';
import { State } from 'src/master/entities/state.entity';
import { City } from 'src/master/entities/city.entity';
import { CompanyIndustry } from 'src/master/entities/companyIndustry.entity';
import { JobPrimaryRole } from 'src/master/entities/jobPrimaryRole.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateJobRequirementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  payment_from: number;
  payment_to: number;
  is_remote: boolean;
  description: string;

  country_id: Country;
  state_id: State;
  city_id: City;
  company_industry_id: CompanyIndustry;
  job_primary_role: JobPrimaryRole;

  @IsEnum(EmploymentType)
  employment_type: EmploymentType;
  @IsEnum(Experience)
  experience: Experience;
  @IsEnum(ExpertiseLevel)
  expertise: ExpertiseLevel;
  @IsEnum(JobPostStatus)
  status: JobPostStatus;
  @IsEnum(PaymentType)
  payment_type: PaymentType;
  @IsEnum(CurrencyChoices)
  payment_currency: CurrencyChoices;
}

export class UpdateJobRequirementDto extends PartialType(
  CreateJobRequirementDto,
) {}
