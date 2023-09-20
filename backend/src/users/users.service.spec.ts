import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserEntity, SessionEntity } from '../core/entities';
import { getRepositoryToken } from '@nestjs/typeorm';

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

describe('AppController', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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
      ],
    }).compile();

    usersService = app.get<UsersService>(UsersService);
  });

  it('should be defined', async () => {
    expect(usersService).toBeDefined();
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
});
