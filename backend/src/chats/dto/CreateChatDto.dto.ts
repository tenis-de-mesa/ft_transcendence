import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsOptional()
  @IsString()
  message?: string;
}
