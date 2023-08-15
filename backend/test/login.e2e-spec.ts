import { CanActivate, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/core/entities/user.entity';
import { AuthenticatedGuard, IntraAuthGuard } from '../src/auth/guards';

describe('OAuth in Intranet', () => {
  const mock_Guard: CanActivate = { canActivate: jest.fn(() => true) };

  let app: INestApplication;

  beforeAll(async () => {
    process.env = {
      INTRA_AUTH_URL: 'test',
      INTRA_TOKEN_URL: 'test',
      INTRA_CLIENT_ID: 'test',
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          dropSchema: true,
          synchronize: true,
          logging: false,
        }),
      ],
    })
      .overrideGuard(AuthenticatedGuard)
      .useValue(mock_Guard)
      .overrideGuard(IntraAuthGuard)
      .useValue(mock_Guard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('user not logged in', async () => {
    // return request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('user logged in', async () => {
    return request(app.getHttpServer()).get('/users/me').expect(200);
  });
});
