import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { AuthenticatedGuard } from '../auth/guards';
import { UsersService } from './users.service';
import { User } from '../core/decorators';
import { UpdateUserDto, AddFriendDto } from './dto';
import { UserEntity } from '../core/entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('/')
  async findAll() {
    return await this.usersService.findAll();
  }

  @Post('/')
  create(@Body() body: UpdateUserDto, @User() user: UserEntity) {
    if (Object.keys(body).length == 0) {
      return;
    }
    return this.usersService.updateUser(user.id, body);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async getMe(@User() user: UserEntity) {
    let blockedBy = [];
    let blockedUsers = [];
    if (user?.id) {
      const [_blockedUsers, _blockedBy] = await Promise.all([
        await this.usersService.getBlockedUsers(user.id),
        await this.usersService.getUsersWhoBlockedMe(user.id),
      ]);
      blockedBy = _blockedBy;
      blockedUsers = _blockedUsers;
    }
    return { ...user, blockedBy, blockedUsers };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('friends')
  async getUserFriends(@Request() req: any) {
    const currentUser = req.user;
    return this.usersService.getUserFriends(currentUser);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('friends')
  async addFriends(@User() user: UserEntity, @Body() body: AddFriendDto) {
    return await this.usersService.addFriend(user, body.friendId);
  }

  @Delete('friends/:friendId')
  async deleteFriend(
    @User() user: UserEntity,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    return await this.usersService.deleteFriend(user, friendId);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('seed')
  async seedUsers() {
    return await this.usersService.seedUsers(25);
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserById(id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post(':blockUserId/block')
  async blockUser(
    @User('id') userId: number,
    @Param('blockUserId', ParseIntPipe) blockUserId: number,
  ): Promise<void> {
    await this.usersService.blockUserById(userId, blockUserId);

    this.eventEmitter.emit('chat.blocked', {
      blockedUserId: blockUserId,
      blockingUserId: userId,
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Post(':unblockUserId/unblock')
  async unblockUser(
    @User('id') userId: number,
    @Param('unblockUserId', ParseIntPipe) unblockUserId: number,
  ): Promise<void> {
    await this.usersService.unblockUserById(userId, unblockUserId);

    this.eventEmitter.emit('chat.unblocked', {
      unblockedUserId: unblockUserId,
      unblockingUserId: userId,
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 2, // 2MB
      },
    }),
  )
  async uploadFile(
    @User() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.usersService.updateAvatar(user, file);
    const updatedUser = await this.usersService.getUserById(user.id);
    const avatarUrl = updatedUser.avatarUrl;
    return { avatarUrl };
  }
}
