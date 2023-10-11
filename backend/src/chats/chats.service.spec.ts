import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ChatAccess,
  ChatEntity,
  ChatMemberEntity,
  ChatMemberRole,
  ChatMemberStatus,
  ChatType,
  MessageEntity,
  UserEntity,
} from '../core/entities';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ChatsService', () => {
  let module: TestingModule;
  let chatsService: ChatsService;
  let userRepository: Repository<UserEntity>;
  let chatRepository: Repository<ChatEntity>;
  let messageRepository: Repository<MessageEntity>;
  let chatMemberRepository: Repository<ChatMemberEntity>;

  const TEST_USER_ID_1 = 1;
  const TEST_USER_ID_2 = 2;
  const TEST_CHAT_ID = 1;
  const TEST_USER_1 = new UserEntity({ id: TEST_USER_ID_1 } as UserEntity);
  const TEST_USER_2 = new UserEntity({ id: TEST_USER_ID_2 } as UserEntity);
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
        {
          provide: getRepositoryToken(ChatMemberEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    userRepository = module.get(getRepositoryToken(UserEntity));
    chatRepository = module.get(getRepositoryToken(ChatEntity));
    messageRepository = module.get(getRepositoryToken(MessageEntity));
    chatMemberRepository = module.get(getRepositoryToken(ChatMemberEntity));
    chatsService = module.get(ChatsService);
  });

  it('should initialize correctly', () => {
    expect(module).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(chatRepository).toBeDefined();
    expect(messageRepository).toBeDefined();
    expect(chatMemberRepository).toBeDefined();
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

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(TEST_USER_1);
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(TEST_CHAT);
      jest.spyOn(messageRepository, 'create').mockReturnValueOnce(mockMessage);
      jest.spyOn(messageRepository, 'save').mockResolvedValueOnce(mockMessage);

      // Act
      const result = await chatsService.addMessage({
        senderId: TEST_USER_ID_1,
        chatId: TEST_CHAT_ID,
        content: TEST_MESSAGE_CONTENT,
      });

      // Assert
      expect(result).toEqual(mockMessage);
    });

    // -- Failure scenarios --
    it('should fail if the chat does not exist', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(TEST_USER_1);
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        chatsService.addMessage({
          senderId: TEST_USER_ID_1,
          chatId: TEST_CHAT_ID,
          content: TEST_MESSAGE_CONTENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail if the user does not exist', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(TEST_CHAT);

      // Act & Assert
      await expect(
        chatsService.addMessage({
          senderId: TEST_USER_ID_1,
          chatId: TEST_CHAT_ID,
          content: TEST_MESSAGE_CONTENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail if the message content is empty', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(TEST_USER_1);
      jest.spyOn(chatRepository, 'findOneBy').mockResolvedValueOnce(TEST_CHAT);

      // Act & Assert
      await expect(
        chatsService.addMessage({
          senderId: TEST_USER_ID_1,
          chatId: TEST_CHAT_ID,
          content: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should successfully create a direct chat with 1 user (self)', async () => {
      // Arrange
      const createChatDto = {
        userIds: [TEST_USER_ID_1],
        type: ChatType.DIRECT,
        access: ChatAccess.PRIVATE,
      };
      const mockChat = new ChatEntity({
        id: 2,
        users: [TEST_USER_1],
      } as ChatEntity);
      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([TEST_USER_1]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);

      // Act
      const result = await chatsService.create(createChatDto, TEST_USER_1);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should successfully create a direct chat with 2 users', async () => {
      // Arrange
      const createChatDto = {
        userIds: [TEST_USER_ID_1, TEST_USER_ID_2],
        type: ChatType.DIRECT,
        access: ChatAccess.PRIVATE,
      };
      const mockChat = new ChatEntity({
        id: 2,
        users: [TEST_USER_1],
      } as ChatEntity);
      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValueOnce([TEST_USER_1, TEST_USER_2]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);

      // Act
      const result = await chatsService.create(createChatDto, TEST_USER_1);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should fail direct chat creation if more than 2 users are provided', async () => {
      // Arrange
      const createChatDto = {
        userIds: [TEST_USER_ID_1, TEST_USER_ID_2, 3],
        type: ChatType.DIRECT,
        access: ChatAccess.PRIVATE,
      };
      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValueOnce([TEST_USER_1, TEST_USER_2]);

      // Act & Assert
      await expect(
        chatsService.create(createChatDto, TEST_USER_1),
      ).rejects.toThrow(BadRequestException);
    });

    it("should fail direct chat creation if user doesn't exist", async () => {
      // Arrange
      const createChatDto = {
        userIds: [999],
        type: ChatType.DIRECT,
        access: ChatAccess.PRIVATE,
      }; // Non-existing user
      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        chatsService.create(createChatDto, TEST_USER_1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully create a channel with 1 user (self)', async () => {
      // Arrange
      const dto = {
        userIds: [TEST_USER_ID_1],
        type: ChatType.CHANNEL,
        access: ChatAccess.PUBLIC,
      };

      const mockChat = new ChatEntity({
        id: 2,
        users: [TEST_USER_1],
      } as ChatEntity);

      const mockChatMember = new ChatMemberEntity({
        userId: TEST_USER_ID_1,
        chatId: mockChat.id,
        role: ChatMemberRole.OWNER,
        status: ChatMemberStatus.ACTIVE,
      });

      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([TEST_USER_1]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);
      jest
        .spyOn(chatMemberRepository, 'save')
        .mockResolvedValueOnce(mockChatMember);

      // Act
      const result = await chatsService.create(dto, TEST_USER_1);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should successfully create a channel with 2 users', async () => {
      // Arrange
      const dto = {
        userIds: [TEST_USER_ID_1, TEST_USER_ID_2],
        type: ChatType.CHANNEL,
        access: ChatAccess.PUBLIC,
      };

      const mockChat = new ChatEntity({
        id: 2,
        users: [TEST_USER_1, TEST_USER_2],
      } as ChatEntity);

      const mockChatMember = new ChatMemberEntity({
        userId: TEST_USER_ID_1,
        chatId: mockChat.id,
        role: ChatMemberRole.OWNER,
        status: ChatMemberStatus.ACTIVE,
      });

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValueOnce([TEST_USER_1, TEST_USER_2]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);
      jest
        .spyOn(chatMemberRepository, 'save')
        .mockResolvedValueOnce(mockChatMember);

      // Act
      const result = await chatsService.create(dto, TEST_USER_1);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should fail channel creation if user is not found', async () => {
      // Arrange
      const dto = {
        userIds: [TEST_USER_ID_1],
        type: ChatType.CHANNEL,
        access: ChatAccess.PUBLIC,
      };

      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([]);

      // Act & Assert
      await expect(chatsService.create(dto, TEST_USER_1)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Additional failure scenarios like chatRepository.save failure can be added
  });

  describe('findAll', () => {
    it('should return all chats for a given user', async () => {
      // Arrange
      const mockChats = [TEST_CHAT];
      jest.spyOn(chatRepository, 'find').mockResolvedValue(mockChats);

      // Act
      const result = await chatsService.findAll(TEST_USER_1);

      // Assert
      expect(result).toEqual(mockChats);
    });

    it('should return an empty array if no chats found', async () => {
      // Arrange
      jest.spyOn(chatRepository, 'find').mockResolvedValue([]);

      // Act
      const result = await chatsService.findAll(TEST_USER_1);

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
