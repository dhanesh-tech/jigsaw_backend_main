import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { UserSkillsModule } from 'src/user-skills/user-skills.module';
import { JobApplicationModule } from 'src/job-application/job-application.module';
import { QuestionBankModule } from 'src/question-bank/question-bank.module';

@Module({
  providers: [CronService],
  imports: [UserSkillsModule, JobApplicationModule, QuestionBankModule],
  exports: [CronService],
})
export class CronModule {}
