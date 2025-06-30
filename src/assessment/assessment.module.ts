import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentKit } from './entities/assessment.entity';
import { AssessmentKitSkill } from './entities/assessmentSkill.entity';
import { AssessmentKitQuestion } from './entities/assessmentQuestion.entity';
import { AssignAssessmentModule } from 'src/assign-assessment/assign-assessment.module';
import { MasterModule } from 'src/master/master.module';
import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { UserSkillsModule } from 'src/user-skills/user-skills.module';
import { UserSkills } from 'src/user-skills/entities/userSkill.entity';

@Module({
  controllers: [AssessmentController],
  providers: [AssessmentService],
  imports: [
    TypeOrmModule.forFeature([
      AssessmentKit,
      AssessmentKitSkill,
      AssessmentKitQuestion,
      AssignedAssessmentKit,
      UserSkills,
    ]),
    AssignAssessmentModule,
    MasterModule,
    UserSkillsModule,
  ],
  exports: [AssessmentService],
})
export class AssessmentModule {}
