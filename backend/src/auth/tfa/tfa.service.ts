import * as crypto from 'crypto';
import * as argon from 'argon2';
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
      tfaSecret: this.tfaEncrypt(secret, process.env.TFA_SECRET_KEY),
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

  async tfaEnable(user: User): Promise<string[]> {
    const recoveryCodes = await this.tfaGenerateRecoveryCodes(user);

    const dto: UpdateUserDto = {
      tfaEnabled: true,
    };

    await this.usersService.updateUser(user.id, dto);

    return recoveryCodes;
  }

  async tfaDisable(user: User): Promise<void> {
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
      secret: this.tfaDecrypt(user.tfaSecret, process.env.TFA_SECRET_KEY),
    });
  }

  async tfaIsRecoveryCodeValid(user: User, tfaCode: string): Promise<boolean> {
    for (const code of user.tfaRecoveryCodes) {
      if (await argon.verify(code, tfaCode)) {
        return true;
      }
    }

    return false;
  }

  async tfaKillSessions(user: User, exceptIds: string[] = []): Promise<void> {
    await this.usersService.killAllSessionsByUserId(user.id, exceptIds);
  }

  async tfaGenerateRecoveryCodes(user: User): Promise<string[]> {
    // TODO: Maybe extract hard coded values into constants
    const recoveryCodes = Array(12)
      .fill(0)
      .map(() => crypto.randomBytes(32).toString('hex').slice(0, 12));

    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map((code) => argon.hash(code)),
    );

    const dto: UpdateUserDto = {
      tfaRecoveryCodes: hashedRecoveryCodes,
    };

    await this.usersService.updateUser(user.id, dto);

    return recoveryCodes;
  }

  private tfaEncrypt(toEncrypt: string, secret: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(secret),
      iv,
    );
    let encrypted = cipher.update(toEncrypt, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private tfaDecrypt(toDecrypt: string, secret: string): string {
    const textParts = toDecrypt.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(secret),
      iv,
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
