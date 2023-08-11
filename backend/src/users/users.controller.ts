import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards';

@Controller('users')
export class UsersController {
  // constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    console.log('UsersController::getMe()'); // TODO: Remove log line
    return req.user;
  }
}
