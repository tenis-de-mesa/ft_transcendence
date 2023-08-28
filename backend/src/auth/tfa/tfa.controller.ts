import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '../../core/entities';
import { AuthenticatedGuard } from '../guards';
import { TfaService } from './tfa.service';
import { TfaDto } from '../dto';

@Controller('tfa')
@UseGuards(AuthenticatedGuard)
export class TfaController {
  constructor(private readonly tfaService: TfaService) {}

  @Post('generate')
  async tfaGenerateSecret(@Res() res: Response, @Req() req: Request) {
    const auth = await this.tfaService.tfaGenerateSecret(req.user as User);
    res.setHeader('Content-Type', 'image/png');
    console.log({ secret: auth.secret });
    await this.tfaService.tfaGenerateQrCode(res, auth.otpAuthUrl);
  }

  @Post('enable')
  async tfaEnable(@Req() req: Request, @Body() dto: TfaDto) {
    if (!this.tfaService.tfaIsCodeValid(req.user as User, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    (req.session as any).tfaAuthenticated = true;
    await this.tfaService.tfaKillSessions(req.user as User, [req.session.id]);
    return await this.tfaService.tfaEnable(req.user as User);
  }

  @Post('disable')
  async tfaDisable(@Req() req: Request, @Body() dto: TfaDto) {
    if (!this.tfaService.tfaIsCodeValid(req.user as User, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    (req.session as any).tfaAuthenticated = false;
    await this.tfaService.tfaKillSessions(req.user as User, [req.session.id]);
    await this.tfaService.tfaDisable(req.user as User);
  }

  @Post('authenticate')
  async tfaAuthenticate(@Req() req: Request, @Body() dto: TfaDto) {
    const isCodeValid = this.tfaService.tfaIsCodeValid(
      req.user as User,
      dto.tfaCode,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }

    (req.session as any).tfaAuthenticated = true;
  }

  @Post('recover')
  async tfaRecover(@Req() req: Request, @Body() dto: TfaDto) {
    const isCodeValid = await this.tfaService.tfaIsRecoveryCodeValid(
      req.user as User,
      dto.tfaCode,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid two factor recovery code');
    }

    (req.session as any).tfaAuthenticated = true;
  }

  @Post('regenerate-recovery-codes')
  async tfaRegenerateRecoveryCodes(@Req() req: Request, @Body() dto: TfaDto) {
    const isCodeValid = this.tfaService.tfaIsCodeValid(
      req.user as User,
      dto.tfaCode,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }

    return await this.tfaService.tfaGenerateRecoveryCodes(req.user as User);
  }
}
