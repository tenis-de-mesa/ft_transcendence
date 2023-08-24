import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return req.user;
  }

  @Get('/friends')
  async getUserFriends(@Request() req: any) {
    const currentUser = req.user;
    return this.usersService.getUserFriends(currentUser);
  }

  @Get('/friends')
  async index() {
    return this.usersService.findAll();
  }
}
