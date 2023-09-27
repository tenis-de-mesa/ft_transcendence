import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { UsersService } from '../users.service';
import { SessionsService } from '../sessions/sessions.service';
import { SessionEntity, UserEntity } from '../../core/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3ClientProvider } from '../../lib/aws/s3Client';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
  providers: [StatusGateway, UsersService, SessionsService, S3ClientProvider],
  exports: [],
})
export class StatusModule {}
