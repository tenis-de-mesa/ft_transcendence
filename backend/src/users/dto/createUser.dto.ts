import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AuthProvider } from '../../core/entities';

export class CreateUserDto {
  @IsOptional()
  @IsNumber()
  intraId?: number;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  provider: AuthProvider;
}
