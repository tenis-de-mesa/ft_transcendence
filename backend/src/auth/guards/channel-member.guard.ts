import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMemberEntity } from '../../core/entities';

@Injectable()
export class ChannelMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(ChatMemberEntity)
    private readonly chatMemberRepository: Repository<ChatMemberEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = Number(request.user?.id);
    const chatId = Number(request.params?.id);

    if (!userId || !chatId) {
      throw new UnauthorizedException('Member or chat not found');
    }

    const member = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    if (!member) {
      throw new UnauthorizedException('User is not a member of this chat');
    }

    if (member.status === 'banned') {
      throw new UnauthorizedException('User is banned from this chat');
    }

    return true;
  }
}
