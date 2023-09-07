import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../../core/entities/user.entity';

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
  login?: string;
}
