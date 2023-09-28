import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum EnvironmentEnum {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  CI = 'ci',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(EnvironmentEnum)
  NODE_ENV: EnvironmentEnum;

  @IsOptional()
  @IsString()
  DATABASE_HOST: string;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  INTRA_AUTH_URL: string;

  @IsOptional()
  @IsString()
  INTRA_TOKEN_URL: string;

  @IsOptional()
  @IsString()
  INTRA_FETCH_URL: string;

  @IsOptional()
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

  @IsNotEmpty()
  @IsString()
  TFA_SECRET_KEY: string;

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY: string;
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
