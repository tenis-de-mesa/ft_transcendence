import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { FriendRequestService } from './friend_request.service';
import { CreateFriendRequestDto } from './friend_request.dto';

@Controller('friend_requests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Get()
  index() {
    return this.friendRequestService.all();
  }

  @Post()
  create(@Body() body: CreateFriendRequestDto) {
    return this.friendRequestService.save(body.sender_id, body.receiver_id);
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    const friend_request = await this.friendRequestService.find(+id);
    if (!friend_request) throw new NotFoundException();
    return friend_request;
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: number) {
    return await this.friendRequestService.accept(id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.friendRequestService.delete(id);
  }
}
