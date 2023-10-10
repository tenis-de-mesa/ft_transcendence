import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity, ChatEntity, MessageEntity } from '../core/entities';
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
  ) {}

  async create(
    createchatsDto: CreateChatDto,
    user: UserEntity,
  ): Promise<ChatEntity> {
    // Add the current user to the userIds
    if (!createchatsDto.userIds.includes(user.id)) {
      createchatsDto.userIds.push(user.id);
    }
    // Check if all userIds are valid
    const userIds = [...new Set(createchatsDto.userIds)];
    const chatUsers = await this.userRepository.findBy({ id: In(userIds) });
    if (chatUsers.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }
    const chat = this.chatRepository.create({ users: chatUsers });
    // Add an aptional initial message to the chat
    if (createchatsDto.message) {
      chat.messages = [
        this.messageRepository.create({
          content: createchatsDto.message,
          user: user,
        }),
      ];
    }
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
    // TODO: filter all data user from only userid

    const chat = await this.chatRepository.findOne({
      relations: ['users', 'messages', 'messages.user'],
      where: { id: id },
    });

    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async addMessage(dto: CreateMessageDto): Promise<MessageEntity> {
    const findChatPromise = this.chatRepository.findOneBy({ id: dto.chatId });
    const findUserPromise = this.userRepository.findOneBy({ id: dto.userId });

    const [chat, user] = await Promise.all([findChatPromise, findUserPromise]);

    if (!chat) {
      throw new NotFoundException(`Chat not found`);
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!dto.content) {
      throw new BadRequestException('Message cannot be empty');
    }

    return this.messageRepository.save({
      chat,
      user,
      content: dto.content,
    });
  }
}
