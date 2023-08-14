import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { IntraAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  // constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(IntraAuthGuard)
  login(@Request() req: any, @Response() res: any): void {
    res.redirect('back');
  }

  @Get('logout')
  logout(@Request() req: any, @Response() res: any) {
    req.session.destroy(function () {
      res.clearCookie('connect.sid', {path: '/'}).redirect('back');
    }); 
  }
}
