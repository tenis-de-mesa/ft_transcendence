import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChatType } from '../../core/entities';

export class CreateChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsNotEmpty()
  @IsEnum(ChatType)
  type: ChatType;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
