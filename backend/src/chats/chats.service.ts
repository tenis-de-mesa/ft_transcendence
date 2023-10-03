import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/CreateChatDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, Chat, Message } from '../core/entities';
import { ChatWithName } from './dto/ChatWithName.dto';

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

  async create(createchatsDto: CreateChatDto): Promise<Chat> {
    const userIds = createchatsDto.userIds;
    const users = await this.userRepository.findBy({ id: In(userIds) });
    return await this.chatRepository.save({ users });
  }

  async findAll(user: User): Promise<Chat[]> {
    const chatsWithoutUsers = await this.chatRepository.find({
      relations: {
        users: true,
      },
      where: {
        users: {
          id: user.id,
        },
      },
    });
    const chatIds = chatsWithoutUsers.map((chat) => chat.id);
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

  findOne(id: number): Promise<Chat> {
    return this.chatRepository.findOne({
      relations: {
        users: true,
        messages: true,
      },
      where: { id: id },
    });
  }

  async addMessage(chatId: number, message: string): Promise<Message> {
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    const newMessage = await this.messageRepository.create({
      content: message,
      chat,
    });
    return this.messageRepository.save(newMessage);
  }
}
