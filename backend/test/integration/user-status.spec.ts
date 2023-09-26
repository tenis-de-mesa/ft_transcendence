import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { AuthProvider, SessionEntity } from '../../src/core/entities';
import { StatusGateway } from '../../src/status/status.gateway';
import { StatusModule } from '../../src/status/status.module';

describe('User Status', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let statusGateway: StatusGateway;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmConfigModule, UsersModule, StatusModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    usersService = app.get(UsersService);
    statusGateway = app.get(StatusGateway);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(usersService).toBeDefined();
    expect(statusGateway).toBeDefined();
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
    const { id } = await usersService.createUser({
      login: 'test2',
      provider: AuthProvider.INTRA,
      intraId: 2,
    });

    const mockSession = jest
      .spyOn(statusGateway, 'getSession')
      .mockResolvedValueOnce(
        new SessionEntity({ userId: id } as SessionEntity),
      );
    // Act

    // TODO: simulate statusGateway.handleConnection
    // statusGateway.handleConnection(new Socket());

    const user = await usersService.getUserById(id);

    // Assert

    //expect(mockSession).toBeCalled();
    //expect(user.status).toEqual('online');
  });
});
