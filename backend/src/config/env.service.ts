import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDatabaseConfig, IIntraConfig } from '../core/interfaces';

@Injectable()
export class EnvironmentConfigService implements IDatabaseConfig, IIntraConfig {
  constructor(private configService: ConfigService) {}

  getNodeEnv(): string {
    return this.configService.get<string>('NODE_ENV');
  }

  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST');
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT');
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
      'http://localhost:3001',
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
}
