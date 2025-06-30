import { Injectable } from '@nestjs/common';
import { STREAM_API_KEY, STREAM_API_SECRET } from 'src/_jigsaw/envDefaults';
import { Channel, StreamChat } from 'stream-chat';
import { UpsertUsersDto, CreateChannelDto } from './dto/chat-client.dto';
import { UpsertUsersResponseDto } from './dto/chat-client.dto';

/**
 * Client service for handling Stream Chat operations.
 *
 * This service provides methods for managing chat operations including:
 * - Token generation
 * - User management
 * - Channel creation and management
 */
@Injectable()
export class ChatClient {
  private client: StreamChat;

  /**
   * Initializes the Stream Chat client with API credentials.
   * Uses STREAM_API_KEY and STREAM_API_SECRET from environment variables.
   */
  constructor() {
    this.client = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
  }

  /**
   * Creates a Stream Chat token for a specific user.
   *
   * @param {number} user_id - The unique identifier of the user
   * @returns {Promise<string>} A promise that resolves to the generated token

   */
  async createChatToken(user_id: number): Promise<string> {
    return this.client.createToken(`${user_id}`);
  }

  /**
   * Creates or updates user records in Stream Chat for both the user and peer.
   *
   * @param {UpsertUsersDto} upsertUsersDto - The DTO containing user and peer details
   * @param {number} upsertUsersDto.user_info.id - The ID of the primary user
   * @param {string} upsertUsersDto.user_info.name - The name of the primary user
   * @param {number} upsertUsersDto.peer_info.id - The ID of the peer user
   * @param {string} upsertUsersDto.peer_info.name - The name of the peer user
   * @param {string} upsertUsersDto.peer_info.user_role - The role of the peer user
   * @param {string} upsertUsersDto.user_info.user_role - The role of the primary user
   * @param {string} upsertUsersDto.peer_info.hash_id - The hash_id of the peer user
   * @param {string} upsertUsersDto.user_info.hash_id - The hash_id of the primary user
   * @returns {Promise<{ users: { [key: string]: UserResponse<ExtendableGenerics> } }>} A promise that resolves to the upserted users' details
  
   */
  async upsertUsersInChat(
    upsertUsersDto: UpsertUsersDto,
  ): Promise<UpsertUsersResponseDto> {
    const { user_info, peer_info } = upsertUsersDto;
    return await this.client.upsertUsers([
      {
        id: `${user_info.id}`,
        name: user_info.name,
        user_role: user_info.role,
        hash_id: user_info.hash_id,
      },
      {
        id: `${peer_info.id}`,
        name: peer_info.name,
        user_role: peer_info.role,
        hash_id: peer_info.hash_id,
      },
    ]);
  }

  /**
   * Creates or retrieves a messaging channel between two users.
   *
   * This method creates a new channel with the following settings:
   * - Channel type: 'messaging'
   * - Channel ID: Combination of user_id and peer_id
   * - Members: Both users are added as channel members
   * - Created by: Set to the primary user_id
   *
   * @param {ChannelDto} channelDto - The DTO containing user and peer details
   * @param {number} channelDto.user_id - The ID of the primary user
   * @param {number} channelDto.peer_id - The ID of the peer user
   * @returns {Promise<Channel>} A promise that resolves to the created or retrieved channel
   */
  async createChannelBetweenUsers(
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const { user_id, peer_id, channel_id } = createChannelDto;
    const channel = await this.client.channel('messaging', channel_id, {
      members: [`${user_id}`, `${peer_id}`],
      created_by_id: `${user_id}`,
    });
    return channel;
  }
}
