import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FriendRequestService } from './friend_request.service';
import { CreateFriendRequestDto } from './dto';
import { AuthenticatedGuard } from '../../auth/guards';
import { User } from '../../core/decorators';
import { UserEntity } from '../../core/entities';

@UseGuards(AuthenticatedGuard)
@Controller('friend_requests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Get()
  async index(@User() user: UserEntity) {
    return await this.friendRequestService.receivedByUser(user);
  }

  @Post()
  create(@Body() body: CreateFriendRequestDto, @User() user: UserEntity) {
    return this.friendRequestService.save(user.id, body.receiver_id);
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
