import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Chat, Message, User } from '../core/entities';
import { Repository } from 'typeorm';

describe('ChatsService', () => {
  let module: TestingModule;
  let chatsService: ChatsService;
  let userRepository: Repository<User>;
  let chatRepository: Repository<Chat>;
  let messageRepository: Repository<Message>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Chat),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Message),
          useClass: Repository,
        },
      ],
    }).compile();
    userRepository = module.get(getRepositoryToken(User));
    chatRepository = module.get(getRepositoryToken(Chat));
    messageRepository = module.get(getRepositoryToken(Message));
    chatsService = module.get(ChatsService);
  });

  it('should be defined', async () => {
    expect(module).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(chatRepository).toBeDefined();
    expect(messageRepository).toBeDefined();
    expect(chatsService).toBeDefined();
  });

  describe('addMessage', () => {
    it('success', async () => {
      // Arrange
      const contentMessage = 'message of test';
      const chat = new Chat({ id: 1 } as Chat);
      const message = new Message({ chat, content: contentMessage } as Message);

      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(chat);

      jest
        .spyOn(messageRepository, 'create')
        .mockResolvedValueOnce(message as never);

      jest.spyOn(messageRepository, 'save').mockResolvedValueOnce(message);

      // Act
      await chatsService.addMessage(chat.id, contentMessage);

      // Assert
      expect(chatRepository.findOneBy).toHaveBeenCalledWith({ id: chat.id });
      expect(messageRepository.create).toHaveBeenCalledWith({
        chat,
        content: contentMessage,
      });
      expect(messageRepository.save).toHaveBeenCalledWith(message);
    });
  });
});
