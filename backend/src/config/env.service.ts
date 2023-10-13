import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDatabaseConfig, IIntraConfig, ITfaConfig } from '../core/interfaces';
import { SecretsManager } from '../lib/aws/SecretsManager';
import { EnvironmentEnum } from './env.validation';

@Injectable()
export class EnvironmentConfigService
  implements IDatabaseConfig, IIntraConfig, ITfaConfig
{
  constructor(
    private configService: ConfigService,
    @Optional() private secretsManager: SecretsManager,
  ) {}

  getNodeEnv(): string {
    return this.configService.get<string>('NODE_ENV');
  }

  getDatabaseHost(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('DATABASE_HOST');
    return this.configService.get<string>('DATABASE_HOST', 'localhost');
  }

  getDatabasePort(): number {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return Number(this.secretsManager.getSecret('DATABASE_PORT'));
    return this.configService.get<number>('DATABASE_PORT', 5432);
  }

  getDatabaseUser(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('DATABASE_USER');
    return this.configService.get<string>('DATABASE_USER');
  }

  getDatabasePassword(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('DATABASE_PASSWORD');
    return this.configService.get<string>('DATABASE_PASSWORD');
  }

  getDatabaseName(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('DATABASE_NAME');
    return this.configService.get<string>('DATABASE_NAME');
  }

  //intra

  getAuthURL(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('INTRA_AUTH_URL');
    return this.configService.get<string>(
      'INTRA_AUTH_URL',
      'https://api.intra.42.fr/oauth/authorize',
    );
  }

  getTokenURL(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('INTRA_TOKEN_URL');
    return this.configService.get<string>(
      'INTRA_TOKEN_URL',
      'https://api.intra.42.fr/oauth/token',
    );
  }

  getFetchURL(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('INTRA_FETCH_URL');
    return this.configService.get<string>(
      'INTRA_FETCH_URL',
      'https://api.intra.42.fr/v2/me',
    );
  }

  getRedirectURL(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('INTRA_REDIRECT_URL');
    return this.configService.get<string>(
      'INTRA_REDIRECT_URL',
      'http://localhost:3001',
    );
  }

  getClientID(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('INTRA_CLIENT_ID');
    return this.configService.get<string>('INTRA_CLIENT_ID');
  }

  getClientSecret(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('INTRA_CLIENT_SECRET');
    return this.configService.get<string>('INTRA_CLIENT_SECRET');
  }

  getSessionSecret(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('SESSION_SECRET');
    return this.configService.get<string>('SESSION_SECRET');
  }

  // tfa

  getTfaSecret(): string {
    if (this.getNodeEnv() == EnvironmentEnum.AWS && this.secretsManager)
      return this.secretsManager.getSecret('TFA_SECRET_KEY');
    return this.configService.get<string>('TFA_SECRET_KEY');
  }
}
