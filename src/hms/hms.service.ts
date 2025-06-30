import { Injectable } from '@nestjs/common';
import { HmsClient } from './hms-client';
import { HmsRoomDto } from './dto/hms-room.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HmsRoomUserRoles } from 'src/_jigsaw/enums';
import { HmsRoomRecording } from './entities/hms-room-recording.entity';
import { AwsService } from 'src/aws/aws.service';
import { MuxService } from 'src/mux/mux.service';
import { MuxResponseDto } from 'src/mux/dto/mux-response.dto';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';

@Injectable()
export class HmsService {
  constructor(
    private readonly hmsClient: HmsClient,

    @InjectRepository(HmsRoomRecording)
    private hmsRecordingRepository: Repository<HmsRoomRecording>,

    private readonly awsService: AwsService,
    private readonly muxService: MuxService,
  ) {}

  /**
   * Creates a new room using the provided room details.
   * @param roomDto - Partial details of the room to be created.
   * @returns The ID of the newly created room.
   */
  async createRoom(roomDto: Partial<HmsRoomDto>): Promise<any> {
    const roomId = await this.hmsClient.createRoom(roomDto);
    return roomId;
  }

  /**
   * Generates an authentication token for a user to join a room.
   * @param room_id - The ID of the room.
   * @param user_details - The details of the user requesting access.
   * @returns The authentication token for the user.
   * @throws HttpException if the user is not authorized to join the scheduled event.
   */
  async generateRoomAuthToken(
    room_id: string,
    user_details: User,
  ): Promise<string> {
    const role = user_details.role;
    const user_id = user_details.id;

    const userRole = HmsRoomUserRoles[role];

    // Create the room token DTO with necessary details
    const roomTokenDto = {
      roomId: room_id,
      role: userRole,
      userId: user_id.toString(),
      issuedAt: Date.now(),
    };

    // Get the authentication token from the HMS client
    const token = await this.hmsClient.getAuthTokenWithOptions(roomTokenDto);
    return token;
  }

  /**
   * Handles the metadata information for a room recording.
   * This method does the following:
   * 1. Saves the metadata information to the repository.
   * 2. Creates a room recording by uploading the recording to Mux.
   * 3. Updates the recording information in the repository.
   *
   * @param recordingData - The metadata information for the room recording.
   * @returns A promise that resolves with the result of the room recording processing.
   */
  async hmsRoomRecordingMetaInfo(recordingData: any): Promise<any> {
    const newHmsRoomRecording = await this.hmsRecordingRepository.create({
      hms_meta_data: recordingData,
      room_id: recordingData.data.room_id,
      session_id: recordingData.data.session_id,
    });
    const savedRoom =
      await this.hmsRecordingRepository.save(newHmsRoomRecording);
    // todo -> add via signal here
    await this.createRoomRecording(savedRoom);
  }

  /**
   * Creates a room recording by uploading the recording to AWS and Mux,
   * then updates the recording information in the repository.
   *
   * @param {HmsRoomRecording} recordingDto - The DTO containing the recording details.
   * @returns {Promise<any>} - A promise that resolves to the updated recording information.
   *
   * @throws {Error} - Throws an error if the upload to AWS or Mux fails, or if the repository update fails.
   */
  // todo -> this service will be called by the events listener
  async createRoomRecording(recordingDto: HmsRoomRecording): Promise<void> {
    const { id, hms_meta_data } = recordingDto;

    const recordingPath = hms_meta_data.data.recording_path;

    const presignedUrl =
      await this.awsService.getHmsAwsSignedUrl(recordingPath);

    const muxResponse: MuxResponseDto =
      await this.muxService.uploadHmsRecording(presignedUrl);

    await this.hmsRecordingRepository.update(id, {
      video_asset_id: muxResponse.video_asset_id,
      video_playback_id: muxResponse.video_playback_id,
      duration_in_seconds: hms_meta_data.data.duration,
      session_started_at:
        hms_meta_data.data.session_started_at || hms_meta_data.data.started_at,
      session_ended_at:
        hms_meta_data.data.session_stopped_at || hms_meta_data.data.stopped_at,
    });

    return;
  }

  /**
   * Retrieves all recordings for a specific room.
   * @param room_id - The ID of the room.
   * @returns A promise that resolves to an array of room recordings.
   */
  async getRoomRecordings(room_id: string): Promise<HmsRoomRecording[]> {
    const recordings = await this.hmsRecordingRepository.find({
      where: { room_id: room_id },
    });
    return recordings.map((recording) =>
      classSerialiser(HmsRoomRecording, recording),
    );
  }

  /**
   * Enables or Disables a room by its ID.
   * @param room_id - The ID of the room to be disabled.
   * @returns A promise that resolves when the room is disabled.
   */
  async enableOrDisableRoom(room_id: string, enabled: boolean): Promise<void> {
    await this.hmsClient.enableOrDisableRoom(room_id, enabled);
  }
}
