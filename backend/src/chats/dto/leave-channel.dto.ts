import { IsOptional, IsNumber } from 'class-validator';

export class LeaveChannelDto {
  @IsOptional()
  @IsNumber()
  newOwnerId?: number;
}
