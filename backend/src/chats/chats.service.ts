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
import { In, Repository } from 'typeorm';
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
} from './dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(UserEntity)
    readonly userRepository: Repository<UserEntity>,

    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    @InjectRepository(ChatMemberEntity)
    private chatMemberRepository: Repository<ChatMemberEntity>,
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
    });
  }

  async update(id: number, dto: UpdateChatDto): Promise<void> {
    const chat = await this.findOne(id);

    const { password, access } = dto;

    chat.password = password ? await argon2.hash(password) : password;
    chat.access = access ?? chat.access;

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
  mapChatsToChatsWithName(
    chats: ChatEntity[],
    currentUser: UserEntity,
  ): ChatWithName[] {
    return chats.map((chat) => {
      const members = chat.users.map((member) => member.user);
      const name = this.generateChatName(members, currentUser);

      return { ...chat, name };
    });
  }

  private generateChatName(
    users: UserEntity[],
    currentUser: UserEntity,
  ): string {
    const otherUsers = users.filter((user) => user.id !== currentUser.id);
    // When a user creates a chat with himself
    if (otherUsers.length === 0) {
      return `${currentUser.nickname} (You)`;
    }
    const names = otherUsers.map((user) => user.nickname);
    return names.join(', ');
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
}
