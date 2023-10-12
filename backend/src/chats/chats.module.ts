import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsGateway } from './chats.gateway';
import { SessionsService } from '../users/sessions/sessions.service';
import {
  UserEntity,
  ChatEntity,
  MessageEntity,
  SessionEntity,
  ChatMemberEntity,
} from '../core/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatEntity,
      UserEntity,
      MessageEntity,
      SessionEntity,
      ChatMemberEntity,
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway, SessionsService],
})
export class ChatsModule {}
