import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session, User } from '../core/entities';
import { UsersController } from './users.controller';
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

describe('UsersController', () => {
  let app: TestingModule;
  let usersController: UsersController;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        S3ClientProvider,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
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

    usersController = app.get<UsersController>(UsersController);
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(usersController).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('index', () => {
    it('show result', async () => {
      // Arrange
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce(usersEntityList);

      // Act
      const result = await usersController.index();

      // Assert
      expect(result).toEqual(usersEntityList);
    });
  });
});
