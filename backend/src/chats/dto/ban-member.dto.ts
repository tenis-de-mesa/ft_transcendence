import { IsNotEmpty, IsNumber } from 'class-validator';

export class BanMemberDto {
  @IsNotEmpty()
  @IsNumber()
  banUserId: number;
}
