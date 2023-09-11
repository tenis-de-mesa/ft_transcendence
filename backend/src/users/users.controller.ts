import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards';
import { UsersService } from './users.service';
import { GetUser } from '../core/decorators';
import { UpdateUserDto } from './dto';
import { User } from '../core/entities';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return req.user;
  }

  @Post('/')
  create(@Body() body: UpdateUserDto, @GetUser() user: User) {
    if (Object.keys(body).length == 0) {
      return;
    }
    return this.usersService.updateUser(user.id, body);
  }

  @Get('/friends')
  async getUserFriends(@Request() req: any) {
    const currentUser = req.user;
    return this.usersService.getUserFriends(currentUser);
  }

  @Get('/')
  async index() {
    return this.usersService.findAll();
  }
}
