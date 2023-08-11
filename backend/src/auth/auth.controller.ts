import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { IntraAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  // constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(IntraAuthGuard)
  login(@Response() res: any): void {
    res.redirect('http://localhost:3001');
  }

  @Get('logout')
  logout(@Request() req: any) {
    req.session.destroy(null);
    return { msg: 'The user session has ended' };
  }
}
