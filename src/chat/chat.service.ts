import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  InitialiseChatResponseDto,
  InitiateChatRoomInputDto,
} from './dto/chat.dto';
import { ChatClient } from './chat-client';
import {
  CHAT_EXCEPTIONS_PEER_NOT_EXIST,
  CHAT_EXCEPTIONS_USER_ID_REQUIRED,
} from 'src/_jigsaw/constants';
import { UsersService } from 'src/users/users.service';
import { USER_ROLE } from 'src/users/utilities/enum';

/**
 * Service for handling Stream Chat operations and token generation.
 * Manages chat room creation, user management, and token generation for Stream Chat.
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly chatClient: ChatClient,
    private readonly userService: UsersService,
  ) {}

  /**
   * Generates a Stream Chat token for a user.
   *
   * @param {number} user_id - The unique identifier of the user
   * @returns {Promise<{token: string}>} Object containing the generated token
   * @throws {HttpException} When user_id is missing or token generation fails
   */
  async generateToken(user_id: number): Promise<{ token: string }> {
    if (!user_id) {
      throw new HttpException(
        CHAT_EXCEPTIONS_USER_ID_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await this.chatClient.createChatToken(user_id);
    return { token };
  }

  /**
   * Initiates or retrieves a chat room between two users.
   *
   * @param {CreateChatStreamIoDto} createChatStreamIoDto - Object containing user and peer information
   * @param {string} createChatStreamIoDto.userId - ID of the initiating user
   * @param {string} createChatStreamIoDto.peerId - ID of the peer user
   * @param {string} createChatStreamIoDto.peerName - Name of the peer user
   * @param {string} createChatStreamIoDto.userName - Name of the initiating user
   * @returns {Promise<{token: string}>} Object containing the generated token
   * @throws {HttpException} When userId is missing or chat room creation fails
   */
  async initiateChatRoom(
    peer_id: number,
    user_info: InitiateChatRoomInputDto,
  ): Promise<InitialiseChatResponseDto> {
    const { id } = user_info;

    // find the peer with id
    const peer = await this.userService.findOne(peer_id);

    if (!peer) {
      throw new HttpException(
        CHAT_EXCEPTIONS_PEER_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!id || !peer_id) {
      throw new HttpException(
        CHAT_EXCEPTIONS_USER_ID_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    const peer_info = {
      id: peer?.id,
      name: peer?.full_name,
      role: peer?.role as USER_ROLE,
      hash_id: peer?.hash_id,
    };
    await this.chatClient.upsertUsersInChat({
      user_info,
      peer_info,
    });

    // Generate token for the user
    const token = await this.chatClient.createChatToken(id);
    // creating the uniques channel id for the chat room
    const channel_id = [id, peer_id].sort().join('-');
    // Channel does not exist, create it
    // @returns the channel object
    const channel = await this.chatClient.createChannelBetweenUsers({
      user_id: id,
      peer_id,
      channel_id,
    });
    // create the channel
    await channel.create();

    return { token, channel_id };
  }
}
