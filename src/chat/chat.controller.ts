import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';

/**
 * Controller for handling chat stream operations.
 *
 * /v1/chat
 */
@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Generate a chat stream token for the authenticated user.
   *
   * /v1/chat/generate-token
   * @param req - The request object containing user information.
   * @param generateTokenDto - The DTO containing token generation parameters.
   * @returns A generated token for chat stream access.
   */
  @Post('/generate-token')
  @UseGuards(JwtAuthGuard)
  async generateToken(@Request() req: any) {
    const user_id = req?.user?.id;
    return this.chatService.generateToken(user_id);
  }

  /**
   * Initiate a new chat room. Only accessible by mentors.
   *
   * /v1/chat/initiate-chat-room
   * @param createChatDto - The DTO containing chat room creation parameters.
   * @returns The created chat room details.
   * @requires USER_ROLE.mentor
   */
  @Post('/initiate-chat-room')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager, USER_ROLE.recruiter)
  async initiateChatRoom(
    @Request() req: any,
    @Body() createChatDto: CreateChatDto,
  ) {
    const user_info = {
      id: req?.user?.id,
      name: req?.user?.full_name,
      role: req?.user?.role,
      hash_id: req?.user?.hash_id,
    };
    const peer_id: number = createChatDto?.peer_id;

    return this.chatService.initiateChatRoom(peer_id, user_info);
  }
}
