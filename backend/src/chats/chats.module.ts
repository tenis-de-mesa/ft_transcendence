import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { UsersModule } from '../users/users.module';

import {
  UserEntity,
  ChatEntity,
  MessageEntity,
  SessionEntity,
  ChatMemberEntity,
} from '../core/entities';
import { BullModule } from '@nestjs/bull';
import { ChatsProcessor } from './chats.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatEntity,
      UserEntity,
      MessageEntity,
      SessionEntity,
      ChatMemberEntity,
    ]),
    BullModule.registerQueue({
      name: 'chats',
    }),
    UsersModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway, ChatsProcessor],
})
export class ChatsModule {}
