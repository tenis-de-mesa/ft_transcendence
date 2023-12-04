import { Controller, Get, Req, Res, Session, UseGuards } from '@nestjs/common';
import { GuestGuard, IntraAuthGuard } from './guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { User } from '../core/decorators';
import { UserEntity } from '../core/entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login/intra')
  @UseGuards(IntraAuthGuard)
  async loginAsIntra(
    @Res() res: Response,
    @Session() session: any,
    @User() user: UserEntity,
  ): Promise<void> {
    if (user.tfaEnabled && !session.tfaAuthenticated) {
      res.redirect('http://localhost:3000/login/tfa-check');
    }
    res.redirect('back');
  }

  @Get('login/guest')
  @UseGuards(GuestGuard)
  async loginAsGuest(@Req() req: Request, @Res() res: Response): Promise<void> {
    req.session.cookie.maxAge = null; // end-of-connection
    res.redirect('back');
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logout(req, res);
  }
}
