import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { EnvironmentConfigService } from './env.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV == 'test'
          ? 'env/.test.env'
          : process.env.NODE_ENV == 'local'
          ? 'env/.local.env'
          : '.env',
      isGlobal: true,
      validate,
    }),
  ],
  providers: [EnvironmentConfigService],
  exports: [EnvironmentConfigService],
})
export class AppConfigModule {}
