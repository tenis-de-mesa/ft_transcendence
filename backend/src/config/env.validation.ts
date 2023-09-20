import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
  Local = 'local',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  DATABASE_HOST: string;
  @IsNumber()
  DATABASE_PORT: number;
  @IsString()
  DATABASE_NAME: string;
  @IsString()
  DATABASE_USER: string;
  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  INTRA_AUTH_URL: string;
  @IsString()
  INTRA_TOKEN_URL: string;
  @IsString()
  INTRA_FETCH_URL: string;
  @IsString()
  INTRA_REDIRECT_URL: string;
  @IsNotEmpty()
  @IsString()
  INTRA_CLIENT_ID: string;
  @IsNotEmpty()
  @IsString()
  INTRA_CLIENT_SECRET: string;
  @IsString()
  SESSION_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
