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
export class TfaController {
  constructor(private readonly tfaService: TfaService) {}

  @Post('generate')
  @UseGuards(AuthenticatedGuard)
  async tfaGenerateSecret(@Res() res: Response, @Req() req: Request) {
    const { otpAuthUrl } = await this.tfaService.tfaGenerateSecret(
      req.user as User,
    );
    return await this.tfaService.tfaGenerateQrCode(res, otpAuthUrl);
  }

  @Post('enable')
  @UseGuards(AuthenticatedGuard)
  async tfaEnable(@Req() req: Request, @Body() dto: TfaDto) {
    if (!this.tfaService.tfaIsCodeValid(req.user as User, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    await this.tfaService.tfaEnable(req.user as User);
    (req.session as any).tfaAuthenticated = true;
  }

  // FIXME: Testing purposes only
  @Get('disable')
  async tfaDisable(@Req() req: Request) {
    await this.tfaService.tfaDisable();
  }

  @Post('authenticate')
  @UseGuards(AuthenticatedGuard)
  async tfaAuthenticate(@Req() req: Request, @Body() dto: TfaDto) {
    if (!this.tfaService.tfaIsCodeValid(req.user as User, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    (req.session as any).tfaAuthenticated = true;
  }
}
