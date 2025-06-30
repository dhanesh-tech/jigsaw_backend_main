import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';
import { AutomatedQuestionBank } from './entities/automatedQuestionBank.entity';
import { Skill } from './entities/skill.entity';
import { Topic } from './entities/topic.entity';
import { JobPrimaryRole } from './entities/jobPrimaryRole.entity';
import { CompanyIndustry } from './entities/companyIndustry.entity';
import { City } from './entities/city.entity';
import { State } from './entities/state.entity';
import { Country } from './entities/country.entity';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutomatedQuestionBank,
      Skill,
      Topic,
      JobPrimaryRole,
      CompanyIndustry,
      City,
      State,
      Country,
      Company,
    ]),
  ],
  controllers: [MasterController],
  providers: [MasterService],
  exports: [MasterService],
})
export class MasterModule {}
