import { ArrayMinSize, IsArray } from 'class-validator';

export class CreateChatDto {
  @IsArray()
  @ArrayMinSize(1)
  userIds: number[];
}
