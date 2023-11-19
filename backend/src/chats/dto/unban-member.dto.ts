import { IsNotEmpty, IsNumber } from 'class-validator';

export class UnbanMemberDto {
  @IsNotEmpty()
  @IsNumber()
  unbanUserId: number;
}
