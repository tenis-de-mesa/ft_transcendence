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

  @Get(':id/friends')
  async getUserFriends(@Param('id') id: number) {
    return this.usersService.getUserFriends(id);
  }
}
