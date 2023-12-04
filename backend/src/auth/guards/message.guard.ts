import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserEntity,
  ChatEntity,
  ChatMemberEntity,
  ChatType,
} from '../../core/entities';

@Injectable()
export class MessageGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectRepository(ChatMemberEntity)
    private readonly chatMemberRepository: Repository<ChatMemberEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = Number(request.user?.id);
    const chatId = Number(request.params?.id);

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        blockedBy: true,
        blockedUsers: true,
      },
    });

    const chat = await this.chatRepository.findOne({
      where: {
        id: chatId,
      },
      relations: {
        users: true,
      },
    });

    const member = await this.chatMemberRepository.findOne({
      where: {
        chatId,
        userId,
      },
    });

    if (chat?.type == ChatType.DIRECT) {
      const blockedUsersIdList = user.blockedUsers.map((u) => u.blockedUserId);
      const blockedByIdList = user.blockedBy.map((u) => u.blockedById);
      const membersIdList = chat.users.map((member) => member.userId);

      for (const memberId of membersIdList) {
        if (blockedByIdList.includes(memberId)) {
          throw new ForbiddenException('You are blocked by this user');
        }

        if (blockedUsersIdList.includes(memberId)) {
          throw new ForbiddenException('You blocked this user');
        }
      }
    }

    if (chat?.type === ChatType.CHANNEL) {
      if (member?.status === 'muted') {
        throw new ForbiddenException('You are currently muted in this chat');
      }
    }

    return true;
  }
}
