import * as argon from 'argon2';
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
import { getQueueToken } from '@nestjs/bull';

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

  const mockQueue = {
    add: jest.fn(),
  };

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
        {
          provide: getQueueToken('chats'),
          useValue: mockQueue,
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

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(TEST_USER_1);
      jest.spyOn(chatRepository, 'findOne').mockResolvedValueOnce(TEST_CHAT);
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
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(TEST_USER_1);
      jest.spyOn(chatRepository, 'findOne').mockResolvedValueOnce(null);

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
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(chatRepository, 'findOne').mockResolvedValueOnce(TEST_CHAT);

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
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(TEST_USER_1);
      jest.spyOn(chatRepository, 'findOne').mockResolvedValueOnce(TEST_CHAT);

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

      const mockMember = new ChatMemberEntity({
        userId: TEST_USER_ID_1,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.MEMBER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockChat = new ChatEntity({
        id: TEST_CHAT_ID,
        users: [mockMember],
      } as ChatEntity);

      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([TEST_USER_1]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);
      jest
        .spyOn(chatMemberRepository, 'save')
        .mockResolvedValueOnce(mockMember);

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

      const mockMember1 = new ChatMemberEntity({
        userId: TEST_USER_ID_1,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.MEMBER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockMember2 = new ChatMemberEntity({
        userId: TEST_USER_ID_2,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.MEMBER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockChat = new ChatEntity({
        id: TEST_CHAT_ID,
        users: [mockMember1, mockMember2],
      } as ChatEntity);

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValueOnce([TEST_USER_1, TEST_USER_2]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);
      jest
        .spyOn(chatMemberRepository, 'save')
        .mockResolvedValueOnce(mockMember1)
        .mockResolvedValueOnce(mockMember2);

      // Act
      const result = await chatsService.create(createChatDto, TEST_USER_1);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should fail direct chat creation if more than 2 users are provided', async () => {
      // Arrange
      const mockThirdUser = new UserEntity({ id: 3 } as UserEntity);

      const createChatDto = {
        userIds: [TEST_USER_ID_1, TEST_USER_ID_2, mockThirdUser.id],
        type: ChatType.DIRECT,
        access: ChatAccess.PRIVATE,
      };
      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValueOnce([TEST_USER_1, TEST_USER_2, mockThirdUser]);

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

      const mockMember = new ChatMemberEntity({
        userId: TEST_USER_ID_1,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.OWNER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockChat = new ChatEntity({
        id: TEST_CHAT_ID,
        users: [mockMember],
      } as ChatEntity);

      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([TEST_USER_1]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);
      jest
        .spyOn(chatMemberRepository, 'save')
        .mockResolvedValueOnce(mockMember);

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

      const mockMember1 = new ChatMemberEntity({
        userId: TEST_USER_ID_1,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.OWNER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockMember2 = new ChatMemberEntity({
        userId: TEST_USER_ID_2,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.MEMBER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockChat = new ChatEntity({
        id: TEST_CHAT_ID,
        users: [mockMember1, mockMember2],
      } as ChatEntity);

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValueOnce([TEST_USER_1, TEST_USER_2]);
      jest.spyOn(chatRepository, 'create').mockReturnValue(mockChat);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);
      jest
        .spyOn(chatMemberRepository, 'save')
        .mockResolvedValueOnce(mockMember1)
        .mockResolvedValueOnce(mockMember2);

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

    it('should create channel with password if password is provided', async () => {
      // Arrange
      const password = 'secret';

      const dto = {
        password,
        type: ChatType.CHANNEL,
        access: ChatAccess.PROTECTED,
        userIds: [TEST_USER_ID_1, TEST_USER_ID_2],
      };

      const mockMember1 = new ChatMemberEntity({
        userId: TEST_USER_ID_1,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.OWNER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockMember2 = new ChatMemberEntity({
        userId: TEST_USER_ID_2,
        chatId: TEST_CHAT_ID,
        role: ChatMemberRole.MEMBER,
        status: ChatMemberStatus.ACTIVE,
      });

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember1, mockMember2],
        type: ChatType.CHANNEL,
        access: ChatAccess.PROTECTED,
        password: await argon.hash(password),
      } as ChatEntity);

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValueOnce([TEST_USER_1, TEST_USER_2]);
      jest.spyOn(chatRepository, 'save').mockResolvedValueOnce(mockChat);
      jest
        .spyOn(chatMemberRepository, 'save')
        .mockResolvedValueOnce(mockMember1)
        .mockResolvedValueOnce(mockMember2);

      // Act
      const result = await chatsService.create(dto, TEST_USER_1);

      // Assert
      expect(result.type).toStrictEqual(ChatType.CHANNEL);
      expect(result.access).toStrictEqual(ChatAccess.PROTECTED);
      expect(await argon.verify(result.password, password)).toBeTruthy();
    });

    // Additional failure scenarios like chatRepository.save failure can be added
  });

  describe('findAll', () => {
    it('should return all chats for a given user', async () => {
      // Arrange
      const mockChats = [TEST_CHAT];
      jest.spyOn(chatRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(mockChats),
      } as any);

      // Act
      const result = await chatsService.findAll(TEST_USER_ID_1);

      // Assert
      expect(result).toEqual(mockChats);
    });

    it('should return an empty array if no chats found', async () => {
      // Arrange
      jest.spyOn(chatRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([]),
      } as any);

      // Act
      const result = await chatsService.findAll(TEST_USER_ID_1);

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

  describe('findDirectChat', () => {
    it('should find a direct chat between two users', async () => {
      // Arrange
      const currentUser = TEST_USER_1;
      const otherUserId = TEST_USER_ID_2;
      jest.spyOn(chatRepository, 'createQueryBuilder').mockReturnValueOnce({
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(TEST_CHAT),
      } as any);
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(TEST_USER_2);
      jest.spyOn(chatsService, 'findOne').mockResolvedValueOnce(TEST_CHAT);

      // Act
      const result = await chatsService.findDirectChat(
        currentUser,
        otherUserId,
      );

      // Assert
      expect(result).toEqual(TEST_CHAT);
    });
  });

  describe('mapChatsToChatsWithName', () => {
    it('direct chat with self should have name "user.nickname (You)"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember],
        type: ChatType.DIRECT,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual(`${mockUser.nickname} (You)`);
    });

    it('direct chat with other user should have name "otherUser.nickname"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockOtherUser = new UserEntity({
        id: 2,
        nickname: 'OtherUser',
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherUser.id,
        user: mockOtherUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember, mockOtherMember],
        type: ChatType.DIRECT,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual(mockOtherUser.nickname);
    });

    it('direct chat with deleted user should have name "Deleted user"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockOtherUser = new UserEntity({
        id: 2,
        nickname: 'OtherUser',
        deletedAt: new Date(),
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherUser.id,
        user: mockOtherUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember, mockOtherMember],
        type: ChatType.DIRECT,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual('Deleted user');
    });

    it('channel chat with self should have name "user.nickname (You)"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember],
        type: ChatType.CHANNEL,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual(`${mockUser.nickname} (You)`);
    });

    it('channel chat with other user should have name "user.nickname (You) and otherUser.nickname"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockOtherUser = new UserEntity({
        id: 2,
        nickname: 'OtherUser',
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherUser.id,
        user: mockOtherUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember, mockOtherMember],
        type: ChatType.CHANNEL,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual(
        `${mockUser.nickname} (You) and ${mockOtherUser.nickname}`,
      );
    });

    it('channel chat with many users should have name "user.nickname (You), otherUser.nickname and otherOtherUser.nickname"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockOtherUser = new UserEntity({
        id: 2,
        nickname: 'OtherUser',
      } as UserEntity);

      const mockOtherOtherUser = new UserEntity({
        id: 3,
        nickname: 'OtherOtherUser',
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherUser.id,
        user: mockOtherUser,
      } as ChatMemberEntity);

      const mockOtherOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherOtherUser.id,
        user: mockOtherOtherUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: TEST_CHAT_ID,
        users: [mockMember, mockOtherMember, mockOtherOtherMember],
        type: ChatType.CHANNEL,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual(
        `${mockUser.nickname} (You), ${mockOtherUser.nickname} and ${mockOtherOtherUser.nickname}`,
      );
    });

    it('channel chat with deleted user should omit deleted users\' name "user.nickname (You)"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockOtherUser = new UserEntity({
        id: 2,
        nickname: 'OtherUser',
        deletedAt: new Date(),
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherUser.id,
        user: mockOtherUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember, mockOtherMember],
        type: ChatType.CHANNEL,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual(`${mockUser.nickname} (You)`);
    });

    it('channel chat with many users should omit deleted users\' name "user.nickname (You) and otherOtherUser.nickname"', () => {
      // Arrange
      const mockUser = new UserEntity({
        id: 1,
        nickname: 'TestUser',
      } as UserEntity);

      const mockOtherUser = new UserEntity({
        id: 2,
        nickname: 'OtherUser',
        deletedAt: new Date(),
      } as UserEntity);

      const mockOtherOtherUser = new UserEntity({
        id: 3,
        nickname: 'OtherOtherUser',
      } as UserEntity);

      const mockMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockUser.id,
        user: mockUser,
      } as ChatMemberEntity);

      const mockOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherUser.id,
        user: mockOtherUser,
      } as ChatMemberEntity);

      const mockOtherOtherMember = new ChatMemberEntity({
        chatId: 1,
        userId: mockOtherOtherUser.id,
        user: mockOtherOtherUser,
      } as ChatMemberEntity);

      const mockChat = new ChatEntity({
        id: 1,
        users: [mockMember, mockOtherMember, mockOtherOtherMember],
        type: ChatType.CHANNEL,
      } as ChatEntity);

      // Act
      const result = chatsService.mapChatsToChatsWithName([mockChat], mockUser);

      // Assert
      expect(result.length).toStrictEqual(1);
      expect(result[0].name).toStrictEqual(
        `${mockUser.nickname} (You) and ${mockOtherOtherUser.nickname}`,
      );
    });
  });
});
