import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HmsService } from './hms.service';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';

@Controller('/v1/hms')
export class HmsController {
  constructor(private readonly hmsService: HmsService) {}
  /**
   * Retrieves all completed interviews on the public profile of a candidate.
   *
   * /v1/hms/room-recordings/:room_id
   * @param room_id - The hash id of the candidate.
   * @returns A list of completed interviews for the candidate.
   */
  @Get('/room-recordings/:room_id')
  @UseGuards(PublicAuthGuard)
  async getRoomRecordings(@Param('room_id') room_id: string) {
    return this.hmsService.getRoomRecordings(room_id);
  }
}
