import * as crypto from 'crypto';
import * as argon from 'argon2';
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserEntity } from '../../core/entities';
import { UsersService } from '../../users/users.service';
import { EnvironmentConfigService } from '../../config/env.service';

export type TfaGenerateResponse = {
  secret: string;
  qrCode: string;
};

type TfaRecoveryCodes = {
  plain: string[];
  hashed: string[];
};

@Injectable()
export class TfaService {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: EnvironmentConfigService,
  ) {}

  async tfaGenerateSecret(user: UserEntity): Promise<TfaGenerateResponse> {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.login,
      'ft_transcendence', // TODO: Maybe put this in .env
      secret,
    );

    const qrCodePromise = toDataURL(otpAuthUrl);
    const updateUserPromise = this.usersService.updateUser(user.id, {
      tfaSecret: this.tfaEncrypt(secret, this.config.getTfaSecret()),
    });

    const [qrCode] = await Promise.all([qrCodePromise, updateUserPromise]);

    return {
      secret,
      qrCode: qrCode.split(',')[1],
    };
  }

  async tfaEnable(user: UserEntity): Promise<string[]> {
    const recoveryCodes = await this.tfaGenerateRecoveryCodes();

    await this.usersService.updateUser(user.id, {
      tfaEnabled: true,
      tfaRecoveryCodes: recoveryCodes.hashed,
    });

    return recoveryCodes.plain;
  }

  async tfaDisable(user: UserEntity): Promise<void> {
    await this.usersService.updateUser(user.id, {
      tfaEnabled: false,
      tfaSecret: null,
      tfaRecoveryCodes: null,
    });
  }

  tfaIsCodeValid(user: UserEntity, tfaCode: string): boolean {
    return authenticator.verify({
      token: tfaCode,
      secret: this.tfaDecrypt(user.tfaSecret, this.config.getTfaSecret()),
    });
  }

  async tfaIsRecoveryCodeValid(
    user: UserEntity,
    tfaCode: string,
  ): Promise<boolean> {
    for (const code of user.tfaRecoveryCodes) {
      if (await argon.verify(code, tfaCode)) {
        return true;
      }
    }

    return false;
  }

  async tfaKillSessions(
    user: UserEntity,
    exceptIds: string[] = [],
  ): Promise<void> {
    await this.usersService.killAllSessionsByUserId(user.id, exceptIds);
  }

  async tfaGenerateRecoveryCodes(): Promise<TfaRecoveryCodes> {
    // TODO: Maybe extract hard coded values into constants
    const recoveryCodes = Array(12)
      .fill(0)
      .map(() => crypto.randomBytes(32).toString('hex').slice(0, 12));

    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map((code) => argon.hash(code)),
    );

    return {
      plain: recoveryCodes,
      hashed: hashedRecoveryCodes,
    };
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
