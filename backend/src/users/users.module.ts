import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity, SessionEntity } from '../core/entities';
import { s3ClientProvider } from '../lib/aws/s3Client';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
  controllers: [UsersController],
  providers: [UsersService, s3ClientProvider],
  exports: [UsersService],
})
export class UsersModule {}
