import { PartialType } from '@nestjs/mapped-types';

export class CompanyDTO {
  name: string;
  contact_phone: string;
  support_email: string;
  domain_url: string;
}

export class UpdateCompanyDTO extends PartialType(CompanyDTO) {}
