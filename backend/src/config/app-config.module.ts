import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentEnum, validate } from './env.validation';
import { EnvironmentConfigService } from './env.service';
import { SecretsManager } from '../lib/aws/SecretsManager';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV == EnvironmentEnum.Test
          ? 'env/.test.env'
          : process.env.NODE_ENV == EnvironmentEnum.CI
          ? 'env/.ci.env'
          : '.env',
      isGlobal: true,
      validate,
    }),
  ],
  providers: [EnvironmentConfigService, SecretsManager],
  exports: [EnvironmentConfigService],
})
export class AppConfigModule {}
