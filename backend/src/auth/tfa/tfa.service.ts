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

  async tfaGenerateQrCode(res: Response, otpAuthUrl: string) {
    return await toFileStream(res, otpAuthUrl);
  }

  async tfaEnable(user: User) {
    const dto: UpdateUserDto = {
      tfaEnabled: true,
    };

    await this.usersService.updateUser(user.id, dto);
  }

  // FIXME: Testing purposes only
  async tfaDisable() {
    const dto: UpdateUserDto = {
      tfaEnabled: false,
    };

    await this.usersService.updateUser(105273, dto);
  }

  tfaIsCodeValid(user: User, tfaCode: string): boolean {
    return authenticator.verify({
      token: tfaCode,
      secret: user.tfaSecret,
    });
  }
}
