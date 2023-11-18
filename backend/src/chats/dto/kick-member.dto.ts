import { IsNotEmpty, IsNumber } from 'class-validator';

export class KickMemberDto {
  @IsNotEmpty()
  @IsNumber()
  kickUserId: number;
}
