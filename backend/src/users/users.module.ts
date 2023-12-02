import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity, SessionEntity } from '../core/entities';
import { S3ClientProvider } from '../lib/aws/s3Client';
import { BlockListEntity } from '../core/entities/blockList.entity';
import { SessionsService } from './sessions/sessions.service';
import { UsersGateway } from './users.gateway';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity, BlockListEntity]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    SessionsService,
    S3ClientProvider,
    UsersGateway,
    EventEmitter2,
  ],
  exports: [
    UsersService,
    SessionsService,
    S3ClientProvider,
    UsersGateway,
    EventEmitter2,
  ],
})
export class UsersModule {}
