import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentCandidateResponse } from 'src/assessment-response/entities/assessmentCandidateResponse.entity';
import { AiTranscription } from './entities/aiTranscription.entity';
import { AiPrompts } from './entities/aiPrompts.entity';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';
import { HmsRoomRecording } from 'src/hms/entities/hms-room-recording.entity';
import { AiAssessmentQuestionResponseAnalysis } from './entities/aiAssessmentQuestionAnalysis.entity';
@Module({
  providers: [AiService],
  controllers: [AiController],
  imports: [
    TypeOrmModule.forFeature([
      AiTranscription,
      AiPrompts,
      AssessmentCandidateResponse,
      CalendarScheduledInterview,
      HmsRoomRecording,
      AiAssessmentQuestionResponseAnalysis,
    ]),
  ],
  exports: [AiService],
})
export class AiModule {}
