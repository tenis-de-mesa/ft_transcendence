import {
  ArrayMinSize,
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
  @ArrayMinSize(1)
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsNotEmpty()
  @IsEnum(ChatType)
  type: ChatType;

  @IsNotEmpty()
  @IsEnum(ChatAccess)
  access: ChatAccess;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
