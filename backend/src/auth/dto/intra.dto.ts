import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class IntraDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  login: string;
}
