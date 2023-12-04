import { IsNotEmpty, IsNumber } from 'class-validator';

export class MuteMemberDto {
  @IsNotEmpty()
  @IsNumber()
  muteUserId: number;

  @IsNotEmpty()
  @IsNumber()
  muteDuration: number;
}
