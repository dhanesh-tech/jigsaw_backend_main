/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JobRequirementService } from './job-requirement.service';
import { JobRequirementController } from './job-requirement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from 'src/master/entities/skill.entity';
import { City } from 'src/master/entities/city.entity';
import { Country } from 'src/master/entities/country.entity';
import { State } from 'src/master/entities/state.entity';
import { JobPrimaryRole } from 'src/master/entities/jobPrimaryRole.entity';
import { JobRequirement } from './entities/jobRequirement.entity';
import { JobRequirementSkill } from './entities/jobRequirementSkill.entity';
import { JobApplication } from 'src/job-application/entities/job-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Country,
      State,
      City,
      Skill,
      JobRequirement,
      JobRequirementSkill,
      JobPrimaryRole,
      JobApplication
    ]),
  ],
  controllers: [JobRequirementController],
  providers: [JobRequirementService],
  exports: [JobRequirementService],
})
export class JobRequirementModule {}
