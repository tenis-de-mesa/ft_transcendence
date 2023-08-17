import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDatabaseConfig } from '../core/interfaces/database.interface';
import { IIntraConfig } from 'src/core/interfaces/intra.interface';

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
    return this.configService.get<string>('INTRA_AUTH_URL');
  }

  getTokenURL(): string {
    return this.configService.get<string>('INTRA_TOKEN_URL');
  }

  getFetchURL(): string {
    return this.configService.get<string>('INTRA_FETCH_URL');
  }

  getRedirectURL(): string {
    return this.configService.get<string>('INTRA_REDIRECT_URL');
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

  getBackendHostname(): string {
    return this.configService.get<string>('BACKEND_HOSTNAME');
  }
}