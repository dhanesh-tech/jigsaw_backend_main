import { Module } from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { JobApplicationController } from './job-application.controller';
import { JobApplication } from './entities/job-application.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRequirement } from 'src/job-requirement/entities/jobRequirement.entity';
import { ReferralInvite } from 'src/referral/entities/referralInvites.entity';
import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { User } from 'src/users/entities/user.entity';
import { PrevettedCandidatesView } from './entities/prevetted-candidates-view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobApplication,
      JobRequirement,
      ReferralInvite,
      AssignedAssessmentKit,
      User,
      PrevettedCandidatesView,
    ]),
  ],
  providers: [JobApplicationService],
  controllers: [JobApplicationController],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
