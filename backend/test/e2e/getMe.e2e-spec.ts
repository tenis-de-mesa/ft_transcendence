import * as request from 'supertest';
import * as session from 'express-session';
import * as passport from 'passport';
import {
  ExecutionContext,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedGuard } from '../../src/auth/guards';
import { AuthProvider, UserEntity } from '../../src/core/entities';
import { UsersService } from '../../src/users/users.service';
import { AppModule } from '../../src/app.module';
import { BlockListEntity } from '../../src/core/entities/blockList.entity';

describe('e2e', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let mockUser: UserEntity;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthenticatedGuard)
      .useValue({
        canActivate: async (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = await usersService.getUserById(mockUser.id);
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalPipes(new ValidationPipe());

    usersService = app.get(UsersService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    mockUser = await usersService.createUser({
      login: 'test',
      intraId: 42,
      provider: AuthProvider.INTRA,
    });
  });

  afterEach(async () => {
    await usersService.deleteUser(mockUser.id);
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
  });

  it('check blocked list', async () => {
    // Arrange
    const tempBlockerUser = await usersService.createUser({
      login: 'blocker',
      provider: AuthProvider.GUEST,
    });
    const tempBlockedUser = await usersService.createUser({
      login: 'blocked',
      provider: AuthProvider.GUEST,
    });
    await Promise.all([
      await usersService.blockUserById(tempBlockerUser.id, mockUser.id),
      await usersService.blockUserById(mockUser.id, tempBlockedUser.id),
    ]);
    // Act
    const response = await request(app.getHttpServer()).get('/users/me');
    // Assert
    expect(response.statusCode).toEqual(HttpStatus.OK);

    const blockedUsers = response.body.blockedUsers.find(
      (user: BlockListEntity) => user.blockedById === mockUser.id,
    );

    const blockedBy = response.body.blockedBy.find(
      (user: BlockListEntity) => user.blockedUserId === mockUser.id,
    );

    expect(blockedBy).toBeDefined();
    expect(blockedUsers).toBeDefined();

    await Promise.all([
      await usersService.unblockUserById(tempBlockerUser.id, mockUser.id),
      await usersService.unblockUserById(mockUser.id, tempBlockedUser.id),
    ]);
  });
});
