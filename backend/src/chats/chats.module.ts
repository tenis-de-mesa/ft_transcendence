import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Chat, Message, Session } from '../core/entities';
import { ChatsGateway } from './chats.gateway';
import { SessionsService } from '../users/sessions/sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, User, Message, Session])],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway, SessionsService],
})
export class ChatsModule {}
