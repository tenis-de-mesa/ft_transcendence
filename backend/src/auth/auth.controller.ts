import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { IntraAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  // constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(IntraAuthGuard)
  login(@Response() res: any): void {
    console.log('AuthController::login()'); // TODO: Remove log line
    res.redirect('http://localhost:3001');
  }

  @Get('logout')
  logout(@Request() req: any) {
    console.log('AuthController::logout()'); // TODO: Remove log line
    req.session.destroy(null);
    return { msg: 'The user session has ended' };
  }
}
