import { CurrencyChoices } from 'src/job-requirement/utilities/enum';

export class JobPaymentDto {
  job_id: number;
  user_id: number;
  job_total_ctc: number;
  percentage: number;
  fee: number;
  currency: CurrencyChoices;
}
