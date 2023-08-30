import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { IntraAuthGuard } from './guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login/intra')
  @UseGuards(IntraAuthGuard)
  async login(@Res() res: Response): Promise<void> {
    res.redirect('back');
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(function () {
      res.clearCookie('connect.sid', { path: '/' }).redirect('back');
    });
  }
}
