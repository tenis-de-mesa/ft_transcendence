import { IsNotEmpty, IsString } from 'class-validator';

export class TfaDto {
  @IsString()
  @IsNotEmpty()
  tfaCode: string;
}
