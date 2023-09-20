import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../../core/entities';

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
  status?: UserStatus;

  @IsString()
  @IsOptional()
  nickname?: string;
}
