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
    const firstWithNickname = users.find((u) => u.id === user1.id);
    expect(firstWithNickname).toBeDefined();
    expect(firstWithNickname.nickname).toEqual('test2');

    const newUser = users.find((u) => u.id !== user1.id);
    expect(newUser).toBeDefined();
    expect(newUser.nickname).not.toEqual('test2');
  });
});
