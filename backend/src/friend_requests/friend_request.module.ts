import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend_request.service';
import { FriendRequestController } from './friend_request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend_request.entity';
import { User } from 'src/core/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, User])],
  exports: [TypeOrmModule],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
})
export class FriendRequestModule {}
