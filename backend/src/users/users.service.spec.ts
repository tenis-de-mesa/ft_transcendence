import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserEntity, SessionEntity, AuthProvider } from '../core/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3ClientProvider } from '../lib/aws/s3Client';
import { BlockListEntity } from '../core/entities/blockList.entity';

const usersEntityList: UserEntity[] = [
  new UserEntity({
    id: 1,
    login: 'login-1',
    nickname: 'login-1',
  } as UserEntity),
  new UserEntity({
    id: 2,
    login: 'login-2',
    nickname: 'login-2',
  } as UserEntity),
  new UserEntity({
    id: 3,
    login: 'login-3',
    nickname: 'login-3',
  } as UserEntity),
];

describe('UsersService', () => {
  let app: TestingModule;
  let usersService: UsersService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      providers: [
        UsersService,
        S3ClientProvider,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(usersEntityList),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BlockListEntity),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = app.get<UsersService>(UsersService);
    userRepository = app.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(usersService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should be returned by findAll', async () => {
      // Arrange

      // Act
      const result = await usersService.findAll();

      // Assert
      expect(result).toEqual(usersEntityList);
    });
  });

  describe('createUser', () => {
    it('creating a user', async () => {
      // Arrange
      const dataUser = {
        login: 'test',
        provider: AuthProvider.GUEST,
        intraId: 1,
      };

      const user: UserEntity = new UserEntity(dataUser as UserEntity);
      jest
        .spyOn(userRepository, 'save')
        .mockImplementationOnce(
          async (user: UserEntity) => new UserEntity({ ...user }),
        );

      // Act
      const result = await usersService.createUser(user);

      // Assert
      expect(result).toEqual({ ...dataUser, nickname: dataUser.login });
    });
    it('creating a user with a nickname already filled in', async () => {
      // Arrange
      const dataUser = {
        login: 'test',
        provider: AuthProvider.GUEST,
        intraId: 1,
      };

      const user: UserEntity = new UserEntity(dataUser as UserEntity);

      jest
        .spyOn(userRepository, 'save')
        .mockImplementationOnce(
          async (user: UserEntity) => new UserEntity({ ...user }),
        );

      jest
        .spyOn(usersService, 'checkNicknameAvailable')
        .mockResolvedValueOnce(false);

      // Act
      const result = await usersService.createUser(user);

      // Assert
      expect(result).toEqual({ ...dataUser, nickname: dataUser.login + '-1' });
    });
  });

  describe('blockUserById', () => {
    it("shouldn't block user", async () => {
      // Arrange
      const userId = 1;
      const userBlockedId = 1;

      // Act
      const result = await usersService.blockUserById(userId, userBlockedId);

      // Assert
      expect(result).toEqual(null);
    });
  });
});
