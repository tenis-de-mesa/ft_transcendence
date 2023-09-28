import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentConfigService } from './env.service';
import { AppConfigModule } from './app-config.module';
import { EnvironmentEnum } from './env.validation';

export const getTypeOrmModuleOptions = (
  config: EnvironmentConfigService,
): TypeOrmModuleOptions => {
  const options: TypeOrmModuleOptions = {
    type: 'postgres',
    host: config.getDatabaseHost(),
    port: config.getDatabasePort(),
    username: config.getDatabaseUser(),
    password: config.getDatabasePassword(),
    database: config.getDatabaseName(),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    subscribers: [__dirname + '/../**/*.subscriber{.ts,.js}'],
    synchronize: true,
    logging: false,
  };

  if (config.getNodeEnv() == EnvironmentEnum.Production) {
    return { ...options, synchronize: false };
  }

  if (config.getNodeEnv() == EnvironmentEnum.Development) {
    return { ...options, synchronize: true };
  }

  if (config.getNodeEnv() == EnvironmentEnum.CI) {
    return { ...options, dropSchema: true };
  }

  if (config.getNodeEnv() == EnvironmentEnum.Test) {
    return { ...options, dropSchema: true };
  }

  return options;
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}
