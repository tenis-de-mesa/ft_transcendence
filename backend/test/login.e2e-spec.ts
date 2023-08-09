import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './../src/auth/auth.module';
import * as request from 'supertest';
import { UserModule } from './../src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { IntraModule } from './../src/intra/intra.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('OAuth in Intranet', () => {
  let app: INestApplication;

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
          dropSchema: true,
          synchronize: true,
          logging: false,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('get', async () => {
    return request(app.getHttpServer()).get('/auth/login').expect(400);
  });
});
