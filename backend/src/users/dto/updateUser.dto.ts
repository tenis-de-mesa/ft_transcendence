import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  tfaSecret?: string;

  @IsBoolean()
  @IsOptional()
  tfaEnabled?: boolean;
}
