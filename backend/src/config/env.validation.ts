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
  Local = 'local',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsString()
  DATABASE_HOST: string;
  @IsNotEmpty()
  @IsNumber()
  DATABASE_PORT: number;
  @IsNotEmpty()
  @IsString()
  DATABASE_NAME: string;
  @IsNotEmpty()
  @IsString()
  DATABASE_USER: string;
  @IsNotEmpty()
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
  @IsNotEmpty()
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
