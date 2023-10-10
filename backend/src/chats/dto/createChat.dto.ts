import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  userIds: number[];
}
