import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  socketId?: string;
}
