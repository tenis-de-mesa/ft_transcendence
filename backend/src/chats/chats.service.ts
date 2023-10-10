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

  async create(createchatsDto: CreateChatDto, user: User): Promise<Chat> {
    // Add the current user's ID to the user IDs array if it is not already present
    if (!createchatsDto.userIds.includes(user.id)) {
      createchatsDto.userIds.push(user.id);
    }
    // Get the chat users from the user IDs
    const userIds = [...new Set(createchatsDto.userIds)];
    const chatUsers = await this.userRepository.findBy({ id: In(userIds) });
    // Check if all users were found
    if (chatUsers.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }
    const chat = this.chatRepository.create({ users: chatUsers });
    // Add the first message to the chat if provided
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
      relations: ['users', 'messages', 'messages.user'],
      where: { id: id },
    });

    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async addMessage(
    userId: number,
    chatId: number,
    message: string,
  ): Promise<Message> {
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!message) {
      throw new BadRequestException('Message cannot be empty');
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    const newMessage = await this.messageRepository.create({
      content: message,
      chat,
      user,
    });
    return this.messageRepository.save(newMessage);
  }
}
