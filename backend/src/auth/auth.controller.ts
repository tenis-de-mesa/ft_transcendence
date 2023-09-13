import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GuestGuard, IntraAuthGuard } from './guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login/intra')
  @UseGuards(IntraAuthGuard)
  async loginAsIntra(@Res() res: Response): Promise<void> {
    res.redirect('back');
  }

  @Get('login/guest')
  @UseGuards(GuestGuard)
  async loginAsGuest(@Req() req: Request, @Res() res: Response): Promise<void> {
    req.session.cookie.maxAge = null;
    res.redirect('back');
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logout(req, res);
  }
}
