import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { AuthProvider, UserEntity } from '../../src/core/entities';
import { StatusGateway } from '../../src/users/status/status.gateway';
import { StatusModule } from '../../src/users/status/status.module';
import { SessionsService } from '../../src/users/sessions/sessions.service';

describe('User Status', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let statusGateway: StatusGateway;
  let sessionsService: SessionsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmConfigModule, UsersModule, StatusModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    usersService = app.get(UsersService);
    statusGateway = app.get(StatusGateway);
    sessionsService = app.get(SessionsService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(usersService).toBeDefined();
    expect(statusGateway).toBeDefined();
    expect(sessionsService).toBeDefined();
  });

  describe('User blocking', () => {
    let user1: UserEntity;
    let user2: UserEntity;
    beforeEach(async () => {
      user1 = await usersService.createUser({
        login: 'test1',
        provider: AuthProvider.GUEST,
        intraId: 1,
      });
      user2 = await usersService.createUser({
        login: 'test2',
        provider: AuthProvider.GUEST,
        intraId: 2,
      });
    });
    it('blocking user', async () => {
      // Arrange
      // Act
      await usersService.blockUserById(user1.id, user2.id);
      const user2blocked = (await usersService.getBlockedUsers(user1.id)).find(
        (user) => user === user2.id,
      );
      // Assert
      expect(user2blocked).toBeDefined();
    });
    it('unblocking user', async () => {
      // Arrange
      await usersService.blockUserById(user1.id, user2.id);
      // Act
      await usersService.unblockUserById(user1.id, user2.id);
      const user2blocked = (await usersService.getBlockedUsers(user1.id)).find(
        (user) => user === user2.id,
      );
      // Assert
      expect(user2blocked).toBeUndefined();
    });
  });
});
