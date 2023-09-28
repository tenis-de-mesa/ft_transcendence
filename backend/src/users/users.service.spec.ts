import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User, Session, AuthProvider } from '../core/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3ClientProvider } from '../lib/aws/s3Client';

const usersEntityList: User[] = [
  new User({
    id: 1,
    login: 'login-1',
    nickname: 'login-1',
  } as User),
  new User({
    id: 2,
    login: 'login-2',
    nickname: 'login-2',
  } as User),
  new User({
    id: 3,
    login: 'login-3',
    nickname: 'login-3',
  } as User),
];

describe('UsersService', () => {
  let app: TestingModule;
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      providers: [
        UsersService,
        S3ClientProvider,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn().mockResolvedValue(usersEntityList),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Session),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = app.get<UsersService>(UsersService);
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
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

      const user: User = new User(dataUser as User);
      jest
        .spyOn(userRepository, 'save')
        .mockImplementationOnce(async (user: User) => new User({ ...user }));

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

      const user: User = new User(dataUser as User);

      jest
        .spyOn(userRepository, 'save')
        .mockImplementationOnce(async (user: User) => new User({ ...user }));

      jest
        .spyOn(usersService, 'checkNicknameAvailable')
        .mockResolvedValueOnce(false);

      // Act
      const result = await usersService.createUser(user);

      // Assert
      expect(result).toEqual({ ...dataUser, nickname: dataUser.login + '-1' });
    });
  });
});
