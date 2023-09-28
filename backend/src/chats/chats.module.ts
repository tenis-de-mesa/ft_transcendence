import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Chat, Session, Message } from '../core/entities';
import { ChatsGateway } from './chats.gateway';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, User, Session, Message])],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway, UsersService, SessionsService],
})
export class ChatsModule {}
