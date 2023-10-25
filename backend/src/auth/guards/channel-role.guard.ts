import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { ChatMemberEntity, ChatMemberRole } from '../../core/entities';

@Injectable()
export class ChannelRoleGuard implements CanActivate {
  constructor(
    @InjectRepository(ChatMemberEntity)
    private readonly chatMemberRepository: Repository<ChatMemberEntity>,

    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get roles from decorator metadata
    const roles = this.reflector.get<ChatMemberRole[]>(
      'ChatMemberRoles',
      context.getHandler(),
    );

    // If no roles are specified in decorator, allow access
    if (!roles) {
      return true;
    }

    // Get user and chat IDs from request
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const chatId = request.params?.id;

    if (!userId || !chatId) {
      throw new UnauthorizedException('User or chat not found');
    }

    // Check if user is a member of the chat
    const member = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    // If user is not a member of the chat, deny access
    if (!member) {
      throw new UnauthorizedException('User is not a member of the chat');
    }

    // Check if user has one of the specified roles
    if (!roles.includes(member.role)) {
      throw new UnauthorizedException('User does not have the required role');
    }

    return true;
  }
}
