import { IsOptional, IsString } from 'class-validator';

export class JoinChannelDto {
  @IsOptional()
  @IsString()
  password?: string;
}
