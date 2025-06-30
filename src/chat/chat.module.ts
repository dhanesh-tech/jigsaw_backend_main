import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatClient } from './chat-client';
import { UsersModule } from 'src/users/user.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatClient],
  imports: [UsersModule],
})
export class ChatModule {}
