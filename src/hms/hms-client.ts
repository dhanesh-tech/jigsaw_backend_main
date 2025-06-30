import { Injectable, Logger } from '@nestjs/common';
import * as HMS from '@100mslive/server-sdk';
import { HmsRoomDto, HmsRoomTokenDto } from './dto/hms-room.dto';
import {
  HMS_APP_ACCESS_KEY,
  HMS_APP_SECRET,
  HMS_ROOM_TEMPLATE_ID,
} from 'src/_jigsaw/envDefaults';
import { generateUniqueUUID } from 'src/_jigsaw/helpersFunc';

import * as jsonwebtoken from 'jsonwebtoken';

@Injectable()
export class HmsClient {
  private hms: any = new HMS.SDK(HMS_APP_ACCESS_KEY, HMS_APP_SECRET);
  private logger: Logger;
  constructor() {}

  /**
   * Creates a new room with the specified room details.
   *
   * @param roomDto - Partial details of the room to be created.
   * @returns A promise that resolves to the ID of the created room.
   * @throws An error if the room creation fails.
   */
  async createRoom(roomDto: Partial<HmsRoomDto>): Promise<any> {
    roomDto.region = 'auto';
    roomDto.template_id = HMS_ROOM_TEMPLATE_ID;

    try {
      const createRoom = await this.hms.rooms.create(roomDto);
      const roomId = createRoom.id;
      return roomId;
    } catch (error) {
      throw new Error(`Error creating room: ${error}`);
    }
  }

  /**
   * Retrieves an authentication token with specified options.
   *
   * @param roomTokenDto - A partial object of type `HmsRoomTokenDto` containing the room token details.
   * @returns A promise that resolves to the authentication token.
   * @throws An error if the token retrieval fails.
   */
  async getAuthTokenWithOptions(
    roomTokenDto: Partial<HmsRoomTokenDto>,
  ): Promise<string> {
    const payload = {
      access_key: HMS_APP_ACCESS_KEY,
      room_id: roomTokenDto.roomId,
      user_id: roomTokenDto.userId,
      role: roomTokenDto.role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    try {
      const token = jsonwebtoken.sign(payload, HMS_APP_SECRET, {
        expiresIn: '5m',
        jwtid: generateUniqueUUID(),
      });
      return token;
    } catch (err) {
      throw new Error(`Error getting 100ms auth token with options: ${err}`);
    }
  }

  /**
   * Enable or Disable a room by its ID.
   *
   * @param roomId - The ID of the room to be disabled.
   * @param enabled - The status of the room to be set.
   * @returns A promise that resolves when the room is disabled.
   * @throws An error if the room disabling fails.
   */
  async enableOrDisableRoom(roomId: string, enabled: boolean): Promise<void> {
    try {
      await this.hms.rooms.enableOrDisable(roomId, enabled);
      return Promise.resolve();
    } catch (error) {
      throw new Error(`Error disabling room: ${error}`);
    }
  }
}
