import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatEntity, MessageEntity, UserEntity } from '../core/entities';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ChatsService', () => {
  let module: TestingModule;
  let chatsService: ChatsService;
  let userRepository: Repository<UserEntity>;
  let chatRepository: Repository<ChatEntity>;
  let messageRepository: Repository<MessageEntity>;

  const TEST_USER_ID = 1;
  const TEST_CHAT_ID = 1;
  const TEST_USER = new UserEntity({ id: TEST_USER_ID } as UserEntity);
  const TEST_CHAT = new ChatEntity({ id: TEST_CHAT_ID } as ChatEntity);
  const TEST_MESSAGE_CONTENT = 'Hello World';

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ChatEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(MessageEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    userRepository = module.get(getRepositoryToken(UserEntity));
    chatRepository = module.get(getRepositoryToken(ChatEntity));
    messageRepository = module.get(getRepositoryToken(MessageEntity));
    chatsService = module.get(ChatsService);
  });

  it('should initialize correctly', () => {
    expect(module).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(chatRepository).toBeDefined();
    expect(messageRepository).toBeDefined();
    expect(chatsService).toBeDefined();
  });

  describe('addMessage', () => {
    // -- Success scenarios --
    it('should add a new message to the chat', async () => {
      // Arrange
      const mockMessage = new MessageEntity({
        chat: TEST_CHAT,
        content: TEST_MESSAGE_CONTENT,
      } as MessageEntity);

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(TEST_USER);
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(TEST_CHAT);
      jest.spyOn(messageRepository, 'create').mockReturnValueOnce(mockMessage);
      jest.spyOn(messageRepository, 'save').mockResolvedValueOnce(mockMessage);

      // Act
      const result = await chatsService.addMessage({
        userId: TEST_USER_ID,
        chatId: TEST_CHAT_ID,
        content: TEST_MESSAGE_CONTENT,
      });

      // Assert
      expect(result).toEqual(mockMessage);
    });

    // -- Failure scenarios --
    it('should fail if the chat does not exist', async () => {
      // Arrange
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(TEST_USER);

      // Act & Assert
      await expect(
        chatsService.addMessage({
          userId: TEST_USER_ID,
          chatId: TEST_CHAT_ID,
          content: TEST_MESSAGE_CONTENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail if the user does not exist', async () => {
      // Arrange
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(TEST_CHAT);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        chatsService.addMessage({
          userId: TEST_USER_ID,
          chatId: TEST_CHAT_ID,
          content: TEST_MESSAGE_CONTENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail if the message content is empty', async () => {
      // Arrange
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(TEST_CHAT);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(TEST_USER);

      // Act & Assert
      await expect(
        chatsService.addMessage({
          userId: TEST_USER_ID,
          chatId: TEST_CHAT_ID,
          content: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should successfully create a chat', async () => {
      // Arrange
      const createChatDto = { userIds: [TEST_USER_ID] };
      const mockChat = new ChatEntity({
        id: 1,
        users: [TEST_USER],
      } as ChatEntity);
      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([TEST_USER]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);

      // Act
      const result = await chatsService.create(createChatDto, TEST_USER);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it("should fail if user the chat user doesn't exist", async () => {
      // Arrange
      const createChatDto = { userIds: [999] }; // Non-existing user
      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        chatsService.create(createChatDto, TEST_USER),
      ).rejects.toThrow(NotFoundException);
    });

    // Additional failure scenarios like chatRepository.save failure can be added
  });

  describe('findAll', () => {
    it('should return all chats for a given user', async () => {
      // Arrange
      const mockChats = [TEST_CHAT];
      jest.spyOn(chatRepository, 'find').mockResolvedValue(mockChats);

      // Act
      const result = await chatsService.findAll(TEST_USER);

      // Assert
      expect(result).toEqual(mockChats);
    });

    it('should return an empty array if no chats found', async () => {
      // Arrange
      jest.spyOn(chatRepository, 'find').mockResolvedValue([]);

      // Act
      const result = await chatsService.findAll(TEST_USER);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a chat by its ID', async () => {
      // Arrange
      const mockChat = new ChatEntity({ id: TEST_CHAT_ID } as ChatEntity);
      jest.spyOn(chatRepository, 'findOne').mockResolvedValueOnce(mockChat);

      // Act
      const result = await chatsService.findOne(TEST_CHAT_ID);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should fail if the chat is not found', async () => {
      // Arrange
      jest.spyOn(chatRepository, 'findOne').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(chatsService.findOne(TEST_CHAT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
