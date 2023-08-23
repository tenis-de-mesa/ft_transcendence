import {
  Body,
  Controller,
  Get,
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
    const { otpAuthUrl } = await this.tfaService.tfaGenerateSecret(
      req.user as User,
    );
    return await this.tfaService.tfaGenerateQrCode(res, otpAuthUrl);
  }

  @Post('enable')
  async tfaEnable(@Req() req: Request, @Body() dto: TfaDto) {
    if (!this.tfaService.tfaIsCodeValid(req.user as User, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    await this.tfaService.tfaEnable(req.user as User);
    (req.session as any).tfaAuthenticated = true;
  }

  @Post('disable')
  async tfaDisable(@Req() req: Request, @Body() dto: TfaDto) {
    if (!this.tfaService.tfaIsCodeValid(req.user as User, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    await this.tfaService.tfaDisable(req.user as User);
  }

  @Post('authenticate')
  async tfaAuthenticate(@Req() req: Request, @Body() dto: TfaDto) {
    if (!this.tfaService.tfaIsCodeValid(req.user as User, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    (req.session as any).tfaAuthenticated = true;
  }
}
