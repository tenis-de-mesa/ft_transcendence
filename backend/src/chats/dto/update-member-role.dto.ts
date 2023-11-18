import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ChatMemberRole } from '../../core/entities';

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsNumber()
  updateUserId: number;

  @IsNotEmpty()
  @IsEnum(ChatMemberRole)
  role: ChatMemberRole;
}
