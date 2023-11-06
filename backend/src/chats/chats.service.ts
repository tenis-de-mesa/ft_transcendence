import * as argon2 from 'argon2';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';
import {
  UserEntity,
  ChatEntity,
  MessageEntity,
  ChatMemberEntity,
  ChatMemberRole,
  ChatType,
  ChatAccess,
} from '../core/entities';
import {
  CreateChatDto,
  ChatWithName,
  CreateMessageDto,
  UpdateChatDto,
  ChangePasswordDto,
} from './dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    @InjectRepository(ChatMemberEntity)
    private readonly chatMemberRepository: Repository<ChatMemberEntity>,
  ) {}

  async create(dto: CreateChatDto, creator: UserEntity): Promise<ChatEntity> {
    // Add creator user to the userIds
    const userIds = [...new Set([...dto.userIds, creator.id])];

    // Check if all users in userIds exist
    const users = await this.userRepository.findBy({ id: In(userIds) });
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    switch (dto.type) {
      case ChatType.DIRECT:
        return await this.createDirectChat(dto, users, creator);

      case ChatType.CHANNEL:
        return await this.createChannelChat(dto, users, creator);

      default:
        throw new BadRequestException('Invalid chat type');
    }
  }

  private async createDirectChat(
    { message }: CreateChatDto,
    users: UserEntity[],
    creator: UserEntity,
  ): Promise<ChatEntity> {
    if (users.length > 2) {
      throw new BadRequestException('Direct chats can have at most 2 users');
    }

    const chat = await this.chatRepository.save({
      type: ChatType.DIRECT,
      access: ChatAccess.PRIVATE,
      messages: message ? [{ sender: creator, content: message }] : undefined,
    });

    users.map(async (user) => {
      await this.chatMemberRepository.save({ user, chat });
    });

    return chat;
  }

  private async createChannelChat(
    { password }: CreateChatDto,
    users: UserEntity[],
    creator: UserEntity,
  ): Promise<ChatEntity> {
    const chat = await this.chatRepository.save({
      type: ChatType.CHANNEL,
      access: password ? ChatAccess.PROTECTED : ChatAccess.PUBLIC,
      password: password ? await argon2.hash(password) : undefined,
      createdByUser: creator.id,
    });

    users.map(async (user) => {
      if (user.id === creator.id) {
        return;
      }
      await this.chatMemberRepository.save({ user, chat });
    });

    await this.chatMemberRepository.save({
      chat,
      user: creator,
      role: ChatMemberRole.OWNER,
    });

    return chat;
  }

  async findOne(id: number): Promise<ChatEntity> {
    // TODO: filter all data user from only userid

    const chat = await this.chatRepository.findOne({
      relations: { users: true, messages: { sender: true } },
      where: { id },
      order: { messages: { createdAt: 'ASC' } },
      withDeleted: true,
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async findAll(user: UserEntity): Promise<ChatEntity[]> {
    const chatsWithoutUsersRelation = await this.chatRepository.find({
      where: { users: { userId: user.id } },
    });

    const chatIds = chatsWithoutUsersRelation.map((chat) => chat.id);

    return await this.chatRepository.find({
      relations: { users: { user: true } },
      where: { id: In(chatIds) },
      withDeleted: true,
    });
  }

  async update(id: number, dto: UpdateChatDto): Promise<void> {
    const chat = await this.findOne(id);

    const { password, access } = dto;

    chat.password = password ? await argon2.hash(password) : password;
    chat.access = access ?? chat.access;

    await this.chatRepository.save(chat);
  }

  async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
    const chat = await this.findOne(id);

    const { currentPassword, newPassword, confirmPassword } = dto;

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException(
        'Non-channel chats cannot be password protected',
      );
    }

    if (chat.access === ChatAccess.PROTECTED) {
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const isPasswordValid = await argon2.verify(
        chat.password,
        currentPassword,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid channel password');
      }
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    chat.password = newPassword ? await argon2.hash(newPassword) : null;
    chat.access = newPassword ? ChatAccess.PROTECTED : ChatAccess.PUBLIC;

    await this.chatRepository.save(chat);
  }

  async verifyPassword(id: number, password: string): Promise<void> {
    const chat = await this.findOne(id);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }
    if (chat.access !== ChatAccess.PROTECTED) {
      throw new BadRequestException('Channel is not password protected');
    }

    const isPasswordValid = await argon2.verify(chat.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid channel password');
    }
  }

  async getMember(chatId: number, userId: number): Promise<ChatMemberEntity> {
    const member = await this.chatMemberRepository.findOne({
      where: { userId, chatId },
    });

    if (!member) {
      throw new NotFoundException('Chat member not found');
    }

    return member;
  }

  async getMemberRole(chatId: number, userId: number): Promise<ChatMemberRole> {
    const member = await this.getMember(chatId, userId);

    return member.role;
  }

  async listAllChats(): Promise<ChatEntity[]> {
    return await this.chatRepository.find({ relations: { users: true } });
  }

  async findDirectChat(
    currentUser: UserEntity,
    otherUserId: number,
  ): Promise<ChatEntity> {
    const otherUser = await this.userRepository.findOneBy({
      id: otherUserId,
    });
    if (!otherUser) {
      throw new NotFoundException('User not found');
    }
    if (currentUser.id == otherUser.id) {
      const selfChat = await this.findSelfChat(currentUser);
      if (!selfChat) {
        throw new NotFoundException('Self chat not found');
      }
      return this.findOne(selfChat.id);
    }

    const userIds = [currentUser.id, otherUser.id];
    const directChat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'member')
      .select('chat.id')
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .andWhere('member.userId IN (:...userIds)', { userIds })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT member.userId) = 2')
      .getOne();

    if (!directChat) {
      throw new NotFoundException('Direct chat not found');
    }
    // Return the chat with relations
    return this.findOne(directChat.id);
  }

  async findSelfChat(user: UserEntity): Promise<ChatEntity | null> {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'member')
      .select('chat.id')
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .andWhere('member.userId = :id', { id: user.id })
      .groupBy('chat.id')
      .having('COUNT(member.userId) = 1')
      .getOne();
  }

  async joinChat(chatId: number, user: UserEntity): Promise<ChatMemberEntity> {
    const chat = this.findOne(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return await this.chatMemberRepository.save({
      userId: user.id,
      chatId: chatId,
    });
  }

  async leaveChat(chatId: number, user: UserEntity): Promise<DeleteResult> {
    const chat = this.findOne(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const query = this.chatMemberRepository
      .createQueryBuilder()
      .delete()
      .from(ChatMemberEntity)
      .where('userId = :userId', { userId: user.id })
      .andWhere('chatId = :chatId', { chatId: chatId });

    return await query.execute();
  }

  async addMessage(dto: CreateMessageDto): Promise<MessageEntity> {
    const findUserPromise = this.userRepository.findOne({
      relations: { blockedBy: true, blockedUsers: true },
      where: { id: dto.senderId },
    });
    const findChatPromise = this.chatRepository.findOne({
      relations: { users: true },
      where: { id: dto.chatId },
    });

    const [chat, user] = await Promise.all([findChatPromise, findUserPromise]);

    if (chat?.type == ChatType.DIRECT) {
      const blockedUsersList = user.blockedUsers.map(
        (block) => block.blockedUserId,
      );
      const blockedList = user.blockedBy.map((block) => block.blockedById);
      const membersList = chat.users.map((member) => member.userId);
      for (const member of membersList) {
        if (blockedList.includes(member)) {
          throw new HttpException('User blocked', HttpStatus.FORBIDDEN);
        }
        if (blockedUsersList.includes(member)) {
          throw new HttpException('User blocked', HttpStatus.FORBIDDEN);
        }
      }
    }

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!dto.content) {
      throw new BadRequestException('Message cannot be empty');
    }

    return this.messageRepository.save({
      chat,
      sender: user,
      content: dto.content,
    });
  }

  mapChatsToChatsWithName(
    chats: ChatEntity[],
    currentUser: UserEntity,
  ): ChatWithName[] {
    return chats.map((chat) => ({
      ...chat,
      name: this.generateChatName(chat, currentUser),
    }));
  }

  private generateChatName(
    { users, type }: ChatEntity,
    currentUser: UserEntity,
  ): string {
    const members = users.map((member) => member.user);
    const otherMembers = members.filter(
      (member) => member.id !== currentUser.id,
    );

    // When a user creates a chat with himself
    if (otherMembers.length === 0) {
      return `${currentUser.nickname} (You)`;
    }

    // Direct chats only have two users, so no need to map nicknames
    if (type === ChatType.DIRECT) {
      const self = otherMembers[0];

      return self.deletedAt ? 'Deleted user' : self.nickname;
    }

    const nicknames: string[] = [`${currentUser.nickname} (You)`];

    otherMembers.forEach((member) => {
      if (!member.deletedAt) {
        nicknames.push(member.nickname);
      }
    });

    return this.joinChatNicknames(nicknames);
  }

  private joinChatNicknames(nicknames: string[]): string {
    if (nicknames.length === 0) {
      return '';
    } else if (nicknames.length === 1) {
      return nicknames[0];
    } else if (nicknames.length === 2) {
      return nicknames.join(' and ');
    } else {
      const last = nicknames.pop();
      return `${nicknames.join(', ')} and ${last}`;
    }
  }
}
