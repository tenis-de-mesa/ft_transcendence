import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsGateway } from './chats.gateway';

import {
  UserEntity,
  ChatEntity,
  MessageEntity,
  SessionEntity,
  ChatMemberEntity,
} from '../core/entities';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatEntity,
      UserEntity,
      MessageEntity,
      SessionEntity,
      ChatMemberEntity,
    ]),
    UsersModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
})
export class ChatsModule {}
