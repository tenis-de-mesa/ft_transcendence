import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { AuthProvider } from '../../src/core/entities';
import { UsersModule } from '../../src/users/users.module';
import { INestApplication } from '@nestjs/common';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';

describe('Unique Name', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, TypeOrmConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = app.get(UsersService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(usersService).toBeDefined();
  });

  it('check unique nicknames', async () => {
    // Arrange

    // Act
    const user1 = await usersService.createUser({
      login: 'test1',
      provider: AuthProvider.INTRA,
      intraId: 1,
    });

    await usersService.updateUser(user1.id, { nickname: 'test2' });

    await usersService.createUser({
      login: 'test2',
      provider: AuthProvider.INTRA,
      intraId: 2,
    });

    const users = await usersService.findAll();

    // Assert
    expect(users.length).toEqual(2);
    expect(users[0].id).toEqual(1);
    expect(users[1].id).toEqual(2);
    expect(users[0].nickname).toEqual('test2');
    expect(users[1].nickname).toEqual('test2-1');
  });
});
