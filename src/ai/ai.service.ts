import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiTranscription } from './entities/aiTranscription.entity';
import { AiPrompts } from './entities/aiPrompts.entity';
import { AiPromptDto } from './dto/aiPrompt.dto';
import { AssessmentCandidateResponse } from 'src/assessment-response/entities/assessmentCandidateResponse.entity';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';
import { AiTranscriptionCompleteDto } from './dto/aiTranscriptionComplete.dto';
import { HmsRoomRecording } from 'src/hms/entities/hms-room-recording.entity';
import { NO_INTERVIEW_OR_ASSESSMENT_RESPONSE_FOUND } from 'src/_jigsaw/constants';
@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiPrompts)
    private aiPromptsRepository: Repository<AiPrompts>,

    @InjectRepository(AiTranscription)
    private aiTranscriptionRepository: Repository<AiTranscription>,

    @InjectRepository(AssessmentCandidateResponse)
    private assessmentCandidateResponseRepository: Repository<AssessmentCandidateResponse>,

    @InjectRepository(CalendarScheduledInterview)
    private scheduledInterviewRepository: Repository<CalendarScheduledInterview>,

    @InjectRepository(HmsRoomRecording)
    private hmsRoomRecordingRepository: Repository<HmsRoomRecording>,
  ) {}

  /**
   * Creates a new AI prompt in the database.
   * @param aiPrompt - The data transfer object containing the details of the AI prompt to be created.
   * @returns A promise that resolves to the created AiPrompts entity.
   */
  async createAiPrompt(aiPrompt: AiPromptDto): Promise<AiPrompts> {
    const saveAiPrompt = this.aiPromptsRepository.create(aiPrompt);
    return this.aiPromptsRepository.save(saveAiPrompt);
  }

  /**
   * Finds the AI transcription status by the given asset ID.
   *
   * @param asset_id - The ID of the asset to find the transcription for.
   * @returns A promise that resolves to an AiTranscriptionCompleteDto containing the transcription status and related IDs.
   * @throws An error if no interview or assessment response is found for the given asset ID.
   */
  async findAiTranscriptionByAssetId(
    asset_id: string,
  ): Promise<AiTranscriptionCompleteDto> {
    const aiTranscriptions = await this.aiTranscriptionRepository.find({
      where: { asset_id },
    });

    if (aiTranscriptions.length > 0) {
      return {
        asset_id,
        is_completed: true,
      };
    }

    const assessmentResponse =
      await this.assessmentCandidateResponseRepository.findOne({
        where: { video_asset_id: asset_id },
      });

    if (assessmentResponse) {
      return {
        asset_id,
        is_completed: false,
        assessment_response_id: assessmentResponse.id,
      };
    }

    const savedRecording = await this.hmsRoomRecordingRepository.findOne({
      where: { video_asset_id: asset_id },
    });

    if (savedRecording) {
      //   find the interview id from the saved recording
      const interview = await this.scheduledInterviewRepository.findOne({
        where: { hms_room_id: savedRecording.room_id },
      });

      if (interview) {
        return {
          asset_id,
          is_completed: false,
          interview_id: interview.id,
        };
      }
    }

    throw new Error(NO_INTERVIEW_OR_ASSESSMENT_RESPONSE_FOUND);
  }
}
