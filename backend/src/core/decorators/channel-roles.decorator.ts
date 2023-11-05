import { SetMetadata } from '@nestjs/common';
import { ChatMemberRole } from '../entities';

export const ChannelRoles = (...roles: ChatMemberRole[]) =>
  SetMetadata('ChatMemberRoles', roles);
