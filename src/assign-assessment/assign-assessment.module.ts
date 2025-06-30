import { Logger, Module } from '@nestjs/common';
import { AssignAssessmentController } from './assign-assessment.controller';
import { AssignAssessmentService } from './assign-assessment.service';
import { AssignedAssessmentKit } from './entities/assignAssessment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSkills } from 'src/user-skills/entities/userSkill.entity';
import { AssessmentKit } from 'src/assessment/entities/assessment.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssignedAssessmentKit,
      UserSkills,
      AssessmentKit,
      User,
    ]),
  ],
  controllers: [AssignAssessmentController],
  providers: [AssignAssessmentService, Logger],
  exports: [AssignAssessmentService],
})
export class AssignAssessmentModule {}
