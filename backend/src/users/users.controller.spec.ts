import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SessionEntity, UserEntity } from '../core/entities';
import { UsersController } from './users.controller';
import { Repository } from 'typeorm';
import { S3ClientProvider } from '../lib/aws/s3Client';
import { ChatsService } from '../chats/chats.service';

describe('UsersController', () => {
  let app: TestingModule;
  let usersController: UsersController;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        S3ClientProvider,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ChatsService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    userRepository = app.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(usersController).toBeDefined();
    expect(userRepository).toBeDefined();
  });
});
