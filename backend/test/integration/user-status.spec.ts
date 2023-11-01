import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { AuthProvider, SessionEntity } from '../../src/core/entities';
import { StatusGateway } from '../../src/users/status/status.gateway';
import { StatusModule } from '../../src/users/status/status.module';
import { SessionsService } from '../../src/users/sessions/sessions.service';
import { Socket } from 'socket.io';

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

  it('default status', async () => {
    // Arrange
    // Act
    await usersService.createUser({
      login: 'test1',
      provider: AuthProvider.INTRA,
      intraId: 1,
    });
    const users = await usersService.findAll();
    // Assert
    expect(users[0].status).toEqual('offline');
  });

  it('user online', async () => {
    // Arrange
    const mockUser = await usersService.createUser({
      login: 'test2',
      provider: AuthProvider.INTRA,
      intraId: 2,
    });
    const mockSession = new SessionEntity({
      userId: mockUser.id,
    } as SessionEntity);
    const mockClient: Socket = {
      id: 'test',
      handshake: {
        auth: {
          user: mockUser,
        },
      },
    } as any;
    jest
      .spyOn(sessionsService, 'getSessionByClientSocket')
      .mockResolvedValueOnce(mockSession);
    jest
      .spyOn(sessionsService, 'updateSession')
      .mockImplementationOnce(jest.fn());

    // Act
    await statusGateway.handleConnection(mockClient);
    const user = await usersService.getUserById(mockUser.id);

    // Assert
    expect(user.status).toEqual('online');
  });
});
