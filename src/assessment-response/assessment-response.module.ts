import { Module } from '@nestjs/common';
import { AssessmentResponseService } from './assessment-response.service';
import { AssessmentResponseController } from './assessment-response.controller';
import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { MasterModule } from 'src/master/master.module';
import { AssignAssessmentModule } from 'src/assign-assessment/assign-assessment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentCandidateResponse } from './entities/assessmentCandidateResponse.entity';
import { AssessmentCandidateResponseRating } from './entities/assessmentCandidateResponseRating.entity';
import { AutomatedQuestionBank } from 'src/master/entities/automatedQuestionBank.entity';

@Module({
  controllers: [AssessmentResponseController],
  providers: [AssessmentResponseService],
  imports: [
    TypeOrmModule.forFeature([
      AssignedAssessmentKit,
      AssessmentCandidateResponse,
      AssessmentCandidateResponseRating,
      AutomatedQuestionBank,
    ]),
    AssignAssessmentModule,
    MasterModule,
  ],
  exports: [AssessmentResponseService],
})
export class AssessmentResponseModule {}
