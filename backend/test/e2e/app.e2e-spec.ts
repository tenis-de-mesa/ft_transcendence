import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthenticatedGuard, IntraAuthGuard } from '../../src/auth/guards';

describe('AppController (e2e)', () => {
  const mock_Guard: CanActivate = { canActivate: jest.fn(() => true) };
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })

      .overrideGuard(AuthenticatedGuard)
      .useValue(mock_Guard)
      .overrideGuard(IntraAuthGuard)
      .useValue(mock_Guard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
