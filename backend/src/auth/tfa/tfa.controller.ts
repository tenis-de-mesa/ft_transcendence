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
import { UserEntity } from '../../core/entities';
import { User } from '../../core/decorators';

@Controller('auth/tfa')
@UseGuards(AuthenticatedGuard)
export class TfaController {
  constructor(private readonly tfaService: TfaService) {}

  @Get('generate')
  @UseGuards(TwoFactorDisabledGuard)
  async tfaGenerateSecret(
    @User() user: UserEntity,
  ): Promise<TfaGenerateResponse> {
    return await this.tfaService.tfaGenerateSecret(user);
  }

  @Post('enable')
  @UseGuards(TwoFactorDisabledGuard)
  async tfaEnable(
    @User() user: UserEntity,
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
    @User() user: UserEntity,
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
    @User() user: UserEntity,
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
    @User() user: UserEntity,
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
    @User() user: UserEntity,
    @Body() dto: TfaDto,
  ): Promise<string[]> {
    if (!this.tfaService.tfaIsCodeValid(user, dto.tfaCode)) {
      throw new UnauthorizedException('Invalid two factor authentication code');
    }

    const { plain } = await this.tfaService.tfaGenerateRecoveryCodes();

    return plain;
  }
}
