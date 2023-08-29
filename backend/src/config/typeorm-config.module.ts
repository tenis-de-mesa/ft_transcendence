import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentConfigService } from './env.service';
import { AppConfigModule } from './app-config.module';

export const getTypeOrmModuleOptions = (
  config: EnvironmentConfigService,
): TypeOrmModuleOptions => {
  const entities = [__dirname + '/../**/*.entity{.ts,.js}'];
  const subscribers = [__dirname + '/../**/*.subscriber{.ts,.js}'];

  if (config.getNodeEnv() == 'test') {
    return {
      type: 'sqlite',
      database: ':memory:',
      entities,
      dropSchema: true,
      synchronize: true,
      logging: false,
    };
  }

  return {
    type: 'postgres',
    host: config.getDatabaseHost(),
    port: config.getDatabasePort(),
    username: config.getDatabaseUser(),
    password: config.getDatabasePassword(),
    database: config.getDatabaseName(),
    entities,
    subscribers,
    synchronize: true,
    // logging: true,
  };
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
