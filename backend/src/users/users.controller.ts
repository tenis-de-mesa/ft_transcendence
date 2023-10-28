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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get('friends')
  async getUserFriends(@Request() req: any) {
    const currentUser = req.user;
    return this.usersService.getUserFriends(currentUser);
  }

  // Route to seed the database with test users
  @UseGuards(AuthenticatedGuard)
  @Post('/seed')
  async seedUsers() {
    return await this.usersService.seedUsers(5);
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getUserById(id);
    return {
      nickname: user.nickname,
      id: user.id,
      avatarUrl: user.avatarUrl,
      login: user.login,
      status: user.status,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('block/:id')
  async blockUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersService.blockUserById(user.id, id);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('unblock/:id')
  async unblockUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersService.unblockUserById(user.id, id);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/friends')
  async addFriends(@User() user: UserEntity, @Body() body: AddFriendDto) {
    return await this.usersService.addFriend(user, body.friendId);
  }

  @Delete('/friends/:friendId')
  async deleteFriend(
    @User() user: UserEntity,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    return await this.usersService.deleteFriend(user, friendId);
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
