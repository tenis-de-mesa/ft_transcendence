import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  AuthenticatedGuard,
  TwoFactorDisabledGuard,
  TwoFactorEnabledGuard,
} from '../guards';
import { TfaGenerateResponse, TfaService } from './tfa.service';
import { TfaDto } from '../dto';
import { User } from '../../core/entities';
import { GetUser } from '../../core/decorators';

@Controller('auth/tfa')
@UseGuards(AuthenticatedGuard)
export class TfaController {
  constructor(private readonly tfaService: TfaService) {}

  @Get('generate')
  @UseGuards(TwoFactorDisabledGuard)
  async tfaGenerateSecret(@GetUser() user: User): Promise<TfaGenerateResponse> {
    return await this.tfaService.tfaGenerateSecret(user);
  }

  @Post('enable')
  @UseGuards(TwoFactorDisabledGuard)
  async tfaEnable(
    @GetUser() user: User,
    @Session() session: any,
    @Body() dto: TfaDto,
  ): Promise<string[]> {
    if (!user.tfaSecret) {
      throw new BadRequestException(
        'Two factor authentication secret must be generated first',
      );
    }
    if (!this.tfaService.tfaIsCodeValid(user, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }
    session.tfaAuthenticated = true;
    await this.tfaService.tfaKillSessions(user, [session.id]);
    return await this.tfaService.tfaEnable(user);
  }

  @Post('disable')
  @UseGuards(TwoFactorEnabledGuard)
  async tfaDisable(
    @GetUser() user: User,
    @Session() session: any,
    @Body() dto: TfaDto,
  ): Promise<void> {
    if (!this.tfaService.tfaIsCodeValid(user, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }

    await Promise.all([
      this.tfaService.tfaKillSessions(user, [session.id]),
      this.tfaService.tfaDisable(user),
    ]);

    session.tfaAuthenticated = false;
  }

  @Post('authenticate')
  @UseGuards(TwoFactorEnabledGuard)
  async tfaAuthenticate(
    @GetUser() user: User,
    @Session() session: any,
    @Body() dto: TfaDto,
  ): Promise<void> {
    if (!this.tfaService.tfaIsCodeValid(user, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }

    session.tfaAuthenticated = true;
  }

  @Post('recover')
  @UseGuards(TwoFactorEnabledGuard)
  async tfaRecover(
    @GetUser() user: User,
    @Session() session: any,
    @Body() dto: TfaDto,
  ): Promise<void> {
    if (!(await this.tfaService.tfaIsRecoveryCodeValid(user, dto.tfaCode))) {
      throw new UnauthorizedException('Invalid two factor recovery code');
    }

    session.tfaAuthenticated = true;
  }

  @Post('regenerate-recovery-codes')
  @UseGuards(TwoFactorEnabledGuard)
  async tfaRegenerateRecoveryCodes(
    @GetUser() user: User,
    @Body() dto: TfaDto,
  ): Promise<string[]> {
    if (!this.tfaService.tfaIsCodeValid(user, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }

    const { plain } = await this.tfaService.tfaGenerateRecoveryCodes(user);

    return plain;
  }
}
