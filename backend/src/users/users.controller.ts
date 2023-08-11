import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards';

@Controller('users')
export class UsersController {
  // constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async getMe() {
    console.log('UsersController::getMe()'); // TODO: Remove log line
    return 'getMe()';
  }
}
