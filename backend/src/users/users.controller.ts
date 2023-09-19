import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards';
import { UsersService } from './users.service';
import { GetUser } from '../core/decorators';
import { UpdateUserDto } from './dto';
import { User } from '../core/entities';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  async index() {
    return this.usersService.findAll();
  }

  @Post('/')
  create(@Body() body: UpdateUserDto, @GetUser() user: User) {
    if (Object.keys(body).length == 0) {
      return;
    }
    return this.usersService.updateUser(user.id, body);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async getMe(@GetUser() user: User) {
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('friends')
  async getUserFriends(@Request() req: any) {
    const currentUser = req.user;
    return this.usersService.getUserFriends(currentUser);
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
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.usersService.updateAvatar(user, file);
    const updatedUser = await this.usersService.getUserById(user.id);
    const avatarUrl = updatedUser.avatarUrl;
    return { avatarUrl };
  }
}
