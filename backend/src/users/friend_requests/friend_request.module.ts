import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend_request.service';
import { FriendRequestController } from './friend_request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, FriendRequestEntity } from '../../core/entities';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequestEntity, UserEntity])],
  exports: [TypeOrmModule],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
})
export class FriendRequestModule {}
