import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity, ChatEntity, MessageEntity } from '../core/entities';
import { CreateChatDto, ChatWithName } from './dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(UserEntity)
    readonly userRepository: Repository<UserEntity>,

    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async create(dto: CreateChatDto): Promise<ChatEntity> {
    const userIds = [...new Set(dto.userIds)];
    const chatUsers = await this.userRepository.findBy({ id: In(userIds) });
    if (chatUsers.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }
    const chat = this.chatRepository.create({ users: chatUsers });
    return this.chatRepository.save(chat);
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
    const chat = await this.chatRepository.findOne({
      relations: {
        users: true,
        messages: true,
      },
      where: { id: id },
    });
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async addMessage(chatId: number, message: string): Promise<MessageEntity> {
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!message) {
      throw new BadRequestException('Message cannot be empty');
    }
    const newMessage = await this.messageRepository.create({
      content: message,
      chat,
    });
    return this.messageRepository.save(newMessage);
  }
}
