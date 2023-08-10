import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import * as request from 'supertest';
import { UserModule } from '../src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { IntraModule } from '../src/intra/intra.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntraService } from '../src/intra/intra.service';
import { User } from '../src/users/user.entity';

describe('OAuth in Intranet', () => {
  let app: INestApplication;

  const FakeIntraService = {
    getUserToken: async (code: string) => {
      if (code == 'valid_code') return 'valid_token';
      else throw new UnauthorizedException();
    },
    getUserInfo: async () => ({ id: 1, login: 'test' }),
  };

  beforeAll(async () => {
    process.env = {
      JWT_SECRET: 'test',
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UserModule,
        IntraModule,
        JwtModule,
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
      .overrideProvider(IntraService)
      .useValue(FakeIntraService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('does not allow login without code', async () => {
    return request(app.getHttpServer()).get('/auth/login').expect(400);
  });

  it('does not allow login with invalid code', async () => {
    return request(app.getHttpServer())
      .get('/auth/login?code=invalid_code')
      .expect(401);
  });

  it('does allow login with valid code', async () => {
    return request(app.getHttpServer())
      .get('/auth/login?code=valid_code')
      .expect(200);
  });
});
