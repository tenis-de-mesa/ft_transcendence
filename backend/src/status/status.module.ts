import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { SessionEntity, UserEntity } from '../core/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
  providers: [StatusGateway, UsersService, SessionsService],
  exports: [],
})
export class StatusModule {}
