import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  chatId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
