import { PartialType } from '@nestjs/mapped-types';
import { UserDto } from 'src/users/dto/user.dto';
import { USER_ROLE } from 'src/users/utilities/enum';

/**
 * Data Transfer Object for chat stream operations.
 *
 * @property {number} peer_id - The unique identifier of the peer user.
 */
export class CreateChatDto {
  peer_id: number;
}

/**
 * Data Transfer Object for generating chat stream tokens.
 *
 * @property {  number} [user_id] - The unique identifier of the user.
 * @property {number} [peer_id] - Optional unique identifier of the peer user.
 */
export class GenerateTokenDto {
  user_id: number;
  peer_id?: number;
}

export class InitialiseChatResponseDto {
  token: string;
  channel_id: string;
}

/**
 * Data Transfer Object for initiating a chat room with complete user context
 *
 * @property {number} id - User ID from authentication
 * @property {string} full_name - User's full name
 * @property {string} role - User's role in the system
 * @property {string} hash_id - User's hash_id
 */
export class InitiateChatRoomInputDto extends PartialType(UserDto) {
  id: number;
  name: string;
  role: USER_ROLE;
  hash_id: string;
}
