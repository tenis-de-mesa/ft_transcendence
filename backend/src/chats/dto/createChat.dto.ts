import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsOptional()
  @IsString()
  message?: string;
}
