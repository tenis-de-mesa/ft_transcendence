import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, Session } from '../core/entities';
import { S3ClientProvider } from '../lib/aws/s3Client';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [UsersController],
  providers: [UsersService, S3ClientProvider],
  exports: [UsersService, S3ClientProvider],
})
export class UsersModule {}
