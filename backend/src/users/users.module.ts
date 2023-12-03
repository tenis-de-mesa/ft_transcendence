import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity, SessionEntity } from '../core/entities';
import { S3ClientProvider } from '../lib/aws/s3Client';
import { BlockListEntity } from '../core/entities/blockList.entity';
import { SessionsService } from './sessions/sessions.service';
import { UsersGateway } from './users.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity, BlockListEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService, SessionsService, S3ClientProvider, UsersGateway],
  exports: [UsersService, SessionsService, S3ClientProvider, UsersGateway],
})
export class UsersModule {}
