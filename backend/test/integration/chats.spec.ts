import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { ChatsModule } from '../../src/chats/chats.module';
import { UsersService } from '../../src/users/users.service';
import { ChatsService } from '../../src/chats/chats.service';
import { AuthProvider, ChatAccess, ChatType } from '../../src/core/entities';
import { UsersModule } from '../../src/users/users.module';

describe('Chats', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let chatsService: ChatsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmConfigModule, ChatsModule, UsersModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    usersService = app.get(UsersService);
    chatsService = app.get(ChatsService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(usersService).toBeDefined();
    expect(chatsService).toBeDefined();
  });

  describe('order messages', () => {
    it('chat direct', async () => {
      // Arrange
      const user1 = await usersService.createUser({
        login: 'user1',
        provider: AuthProvider.GUEST,
      });
      const user2 = await usersService.createUser({
        login: 'user2',
        provider: AuthProvider.GUEST,
      });
      const chat = await chatsService.create(
        {
          userIds: [user1.id, user2.id],
          access: ChatAccess.PUBLIC,
          type: ChatType.DIRECT,
        },
        user1,
      );
      await chatsService.addMessage({
        content: 'message 1',
        chatId: chat.id,
        senderId: user1.id,
      });
      await chatsService.addMessage({
        content: 'message 2',
        chatId: chat.id,
        senderId: user2.id,
      });
      await chatsService.addMessage({
        content: 'message 3',
        chatId: chat.id,
        senderId: user1.id,
      });
      await chatsService.addMessage({
        content: 'message 4',
        chatId: chat.id,
        senderId: user2.id,
      });
      // Act
      const { messages } = await chatsService.findOne(chat.id);
      // Assert
      expect(messages[0].content).toEqual('message 1');
      expect(messages[1].content).toEqual('message 2');
      expect(messages[2].content).toEqual('message 3');
      expect(messages[3].content).toEqual('message 4');
    });
  });
});
