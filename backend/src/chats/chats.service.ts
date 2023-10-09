import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/CreateChatDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, Chat, Message } from '../core/entities';
import { ChatWithName } from './dto/ChatWithName.dto';
import { CreateMessageDto } from './dto/createMessage.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(User)
    readonly userRepository: Repository<User>,

    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(dto: CreateChatDto): Promise<Chat> {
    const userIds = [...new Set(dto.userIds)];
    const chatUsers = await this.userRepository.findBy({ id: In(userIds) });
    if (chatUsers.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }
    const chat = this.chatRepository.create({ users: chatUsers });
    return this.chatRepository.save(chat);
  }

  async findAll(user: User): Promise<Chat[]> {
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

  mapChatsToChatsWithName(chats: Chat[], currentUser: User): ChatWithName[] {
    return chats.map((chat) => ({
      ...chat,
      name: this.generateChatName(chat.users, currentUser),
    }));
  }

  private generateChatName(users: User[], currentUser: User): string {
    const otherUsers = users.filter((user) => user.id !== currentUser.id);
    // When a user creates a chat with himself
    if (otherUsers.length === 0) {
      return `${currentUser.nickname} (You)`;
    }
    const names = otherUsers.map((user) => user.nickname);
    return names.join(', ');
  }

  async findOne(id: number): Promise<Chat> {
    // TODO: filter all data user from only userid

    const chat = await this.chatRepository.findOne({
      relations: ['users', 'messages', 'messages.sender'],
      where: { id: id },
    });

    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async addMessage(dto: CreateMessageDto): Promise<Message> {
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
