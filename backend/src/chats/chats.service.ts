import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
} from '../core/entities';
import { CreateChatDto, ChatWithName, CreateMessageDto } from './dto';

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
    const userIds = [...new Set(dto.userIds)];
    if (!userIds.includes(creator.id)) {
      userIds.push(creator.id);
    }

    // Check if direct chat has at most 2 users
    if (dto.type === ChatType.DIRECT && userIds.length > 2) {
      throw new BadRequestException('Direct chats must have at most 2 users');
    }

    // Check if all users in userIds exist
    const chatUsers = await this.userRepository.findBy({ id: In(userIds) });
    if (chatUsers.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    // Effectively create the chat
    const chat = await this.chatRepository.save({
      users: chatUsers,
      type: dto.type,
      access: dto.access,
    });

    // if channel, set creator as owner of the chat
    if (dto.type === ChatType.CHANNEL) {
      await this.chatMemberRepository.save({
        userId: creator.id,
        chatId: chat.id,
        role: ChatMemberRole.OWNER,
      });
    }

    // Add an optional initial message to the chat
    if (dto.message) {
      await this.addMessage({
        senderId: creator.id,
        chatId: chat.id,
        content: dto.message,
      });
    }

    return chat;
  }

  async findAll(user: UserEntity): Promise<ChatEntity[]> {
    const chatsWithoutUsersRelation = await this.chatRepository.find({
      relations: {
        users: true,
      },
      where: {
        users: {
          id: user.id,
        },
      },
    });
    const chatIds = chatsWithoutUsersRelation.map((chat) => chat.id);
    return await this.chatRepository.find({
      relations: {
        users: true,
      },
      where: {
        id: In(chatIds),
      },
    });
  }

  mapChatsToChatsWithName(
    chats: ChatEntity[],
    currentUser: UserEntity,
  ): ChatWithName[] {
    return chats.map((chat) => ({
      ...chat,
      name: this.generateChatName(chat.users, currentUser),
    }));
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

  async findOne(id: number): Promise<ChatEntity> {
    // TODO: filter all data user from only userid

    const chat = await this.chatRepository.findOne({
      relations: ['users', 'messages', 'messages.sender'],
      where: { id: id },
    });

    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async addMessage(dto: CreateMessageDto): Promise<MessageEntity> {
    const findUserPromise = this.userRepository.findOneBy({ id: dto.senderId });
    const findChatPromise = this.chatRepository.findOneBy({ id: dto.chatId });

    const [chat, user] = await Promise.all([findChatPromise, findUserPromise]);

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
