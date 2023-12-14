import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDatabaseConfig, IIntraConfig, ITfaConfig } from '../core/interfaces';

@Injectable()
export class EnvironmentConfigService
  implements IDatabaseConfig, IIntraConfig, ITfaConfig
{
  constructor(private configService: ConfigService) {}

  getNodeEnv(): string {
    return this.configService.get<string>('NODE_ENV');
  }

  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST', 'localhost');
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT', 5432);
  }

  getDatabaseUser(): string {
    return this.configService.get<string>('DATABASE_USER');
  }

  getDatabasePassword(): string {
    return this.configService.get<string>('DATABASE_PASSWORD');
  }

  getDatabaseName(): string {
    return this.configService.get<string>('DATABASE_NAME');
  }

  //intra

  getAuthURL(): string {
    return this.configService.get<string>(
      'INTRA_AUTH_URL',
      'https://api.intra.42.fr/oauth/authorize',
    );
  }

  getTokenURL(): string {
    return this.configService.get<string>(
      'INTRA_TOKEN_URL',
      'https://api.intra.42.fr/oauth/token',
    );
  }

  getFetchURL(): string {
    return this.configService.get<string>(
      'INTRA_FETCH_URL',
      'https://api.intra.42.fr/v2/me',
    );
  }

  getRedirectURL(): string {
    return this.configService.get<string>(
      'INTRA_REDIRECT_URL',
      'https://transcendence.ngrok.app/api',
    );
  }

  getClientID(): string {
    return this.configService.get<string>('INTRA_CLIENT_ID');
  }

  getClientSecret(): string {
    return this.configService.get<string>('INTRA_CLIENT_SECRET');
  }

  getSessionSecret(): string {
    return this.configService.get<string>('SESSION_SECRET');
  }

  // tfa

  getTfaSecret(): string {
    return this.configService.get<string>('TFA_SECRET_KEY');
  }
}
