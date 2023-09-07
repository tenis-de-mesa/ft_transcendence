import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { Session, User } from '../core/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  providers: [StatusGateway, UsersService, SessionsService],
  exports: [],
})
export class StatusModule {}
