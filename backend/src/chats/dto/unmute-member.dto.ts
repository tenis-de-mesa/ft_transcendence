import { IsNotEmpty, IsNumber } from 'class-validator';

export class UnmuteMemberDto {
  @IsNotEmpty()
  @IsNumber()
  unmuteUserId: number;
}
