import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { ChatsModule } from '../../src/chats/chats.module';
import { UsersService } from '../../src/users/users.service';
import { ChatsService } from '../../src/chats/chats.service';
import {
  AuthProvider,
  ChatEntity,
  ChatType,
  UserEntity,
} from '../../src/core/entities';
import { UsersModule } from '../../src/users/users.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('Chats', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let chatsService: ChatsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmConfigModule,
        ChatsModule,
        UsersModule,
      ],
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

  describe('simulate chat 4 messages', () => {
    let user1: UserEntity;
    let user2: UserEntity;
    let chat: ChatEntity;
    beforeEach(async () => {
      user1 = await usersService.createUser({
        login: 'user1',
        provider: AuthProvider.GUEST,
      });
      user2 = await usersService.createUser({
        login: 'user2',
        provider: AuthProvider.GUEST,
      });
      chat = await chatsService.create(
        {
          userIds: [user1.id, user2.id],
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
    });
    describe('order messages', () => {
      it('chat direct', async () => {
        // Act
        const { messages } = await chatsService.findOne(chat.id);
        // Assert
        expect(messages[0].content).toEqual('message 1');
        expect(messages[1].content).toEqual('message 2');
        expect(messages[2].content).toEqual('message 3');
        expect(messages[3].content).toEqual('message 4');
      });
    });

    describe('deleted user messages', () => {
      it('check users', async () => {
        // Act
        const { messages } = await chatsService.findOne(chat.id);
        // Assert
        expect(messages[0].sender?.id).toEqual(user1.id);
        expect(messages[1].sender?.id).toEqual(user2.id);
        expect(messages[2].sender?.id).toEqual(user1.id);
        expect(messages[3].sender?.id).toEqual(user2.id);
      });
      it('after deleteUser', async () => {
        // Act
        await usersService.deleteUser(user1.id);
        const { messages } = await chatsService.findOne(chat.id);
        // Assert
        expect(messages[0].sender?.id).toEqual(user1.id);
        expect(messages[0].sender?.login).toEqual(null);
        expect(messages[1].sender?.id).toEqual(user2.id);
        expect(messages[1].sender?.login).toEqual(user2.login);
        expect(messages[2].sender?.id).toEqual(user1.id);
        expect(messages[2].sender?.login).toEqual(null);
        expect(messages[3].sender?.id).toEqual(user2.id);
        expect(messages[3].sender?.login).toEqual(user2.login);
      });
    });
  });
  describe('blocked user messages', () => {
    it('check messages', async () => {
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
          type: ChatType.DIRECT,
        },
        user1,
      );
      await chatsService.addMessage({
        content: 'message 1',
        chatId: chat.id,
        senderId: user1.id,
      });
      await usersService.blockUserById(user1.id, user2.id);
      try {
        await chatsService.addMessage({
          content: 'message 2',
          chatId: chat.id,
          senderId: user2.id,
        });
      } catch (e) {}
      try {
        await chatsService.addMessage({
          content: 'message 3',
          chatId: chat.id,
          senderId: user1.id,
        });
      } catch (e) {}
      await usersService.unblockUserById(user1.id, user2.id);
      await chatsService.addMessage({
        content: 'message 4',
        chatId: chat.id,
        senderId: user2.id,
      });
      // Act
      const { messages } = await chatsService.findOne(chat.id);
      // Assert
      expect(messages[0].content).toEqual('message 1');
      expect(messages[1].content).toEqual('message 4');
    });
  });
});
