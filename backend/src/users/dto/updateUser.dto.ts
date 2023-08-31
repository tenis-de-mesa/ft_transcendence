import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  tfaSecret?: string;

  @IsBoolean()
  @IsOptional()
  tfaEnabled?: boolean;

  @IsArray()
  @IsOptional()
  tfaRecoveryCodes?: string[];

  @IsString()
  @IsOptional()
  status?: string;
}
