import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChatAccess } from '../../core/entities';

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(ChatAccess)
  access?: ChatAccess;
}
