import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { UpdateUserDto } from '../../users/dto';
import { User } from '../../core/entities';
import { UsersService } from '../../users/users.service';

@Injectable()
export class TfaService {
  constructor(private readonly usersService: UsersService) {}

  async tfaGenerateSecret(
    user: User,
  ): Promise<{ secret: string; otpAuthUrl: string }> {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.login,
      'ft_transcendence', // TODO: Maybe put this in .env
      secret,
    );

    const dto: UpdateUserDto = {
      tfaSecret: secret,
    };

    await this.usersService.updateUser(user.id, dto);

    return {
      secret,
      otpAuthUrl,
    };
  }

  async tfaGenerateQrCode(res: Response, otpAuthUrl: string): Promise<void> {
    await toFileStream(res, otpAuthUrl);
  }

  async tfaEnable(user: User) {
    const dto: UpdateUserDto = {
      tfaEnabled: true,
      tfaRecoveryCodes: this.tfaGenerateRecoveryCodes(),
    };

    await this.usersService.updateUser(user.id, dto);
  }

  async tfaDisable(user: User) {
    const dto: UpdateUserDto = {
      tfaEnabled: false,
      tfaSecret: null,
      tfaRecoveryCodes: null,
    };

    await this.usersService.updateUser(user.id, dto);
  }

  tfaIsCodeValid(user: User, tfaCode: string): boolean {
    return authenticator.verify({
      token: tfaCode,
      secret: user.tfaSecret,
    });
  }

  async tfaIsRecoveryCodeValid(u: User, tfaCode: string): Promise<boolean> {
    const user = await this.usersService.getUserById(u.id);

    return user.tfaRecoveryCodes.includes(tfaCode);
  }

  async tfaKillSessions(user: User, exceptIds: string[] = []) {
    return await this.usersService.killAllSessionsByUserId(user.id, exceptIds);
  }

  private tfaGenerateRecoveryCodes(): string[] {
    const recoveryCodes = Array(12)
      .fill(0)
      .map(() => crypto.randomBytes(32).toString('hex').slice(0, 12));

    // TODO: Maybe extract hard coded values into constants

    return recoveryCodes;
  }
}
