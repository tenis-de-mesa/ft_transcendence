import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChatAccess, ChatType } from '../../core/entities';

export class CreateChatDto {
  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsNotEmpty()
  @IsEnum(ChatType)
  type: ChatType;

  @IsOptional()
  @IsEnum(ChatAccess)
  access?: ChatAccess;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
