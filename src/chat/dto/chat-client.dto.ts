import { UserResponse } from 'stream-chat';
import { ExtendableGenerics } from 'stream-chat';
import { InitiateChatRoomInputDto } from './chat.dto';

export interface UpsertUsersResponseDto {
  users: { [key: string]: UserResponse<ExtendableGenerics> };
}
export class UpsertUsersDto {
  user_info: InitiateChatRoomInputDto;
  peer_info: InitiateChatRoomInputDto;
}

export class CreateChannelDto {
  user_id: number;
  peer_id: number;
  channel_id: string;
}
