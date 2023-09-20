import { CanActivate, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthenticatedGuard, IntraAuthGuard } from '../src/auth/guards';
import { AppModule } from '../src/app.module';

describe('OAuth in Intranet', () => {
  describe('not logged', () => {
    const mock_Guard: CanActivate = { canActivate: jest.fn(() => false) };
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

    it('check status', async () => {
      return request(app.getHttpServer()).get('/users/me').expect(403);
    });
  });

  describe('logged', () => {
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

    it('check status', async () => {
      return request(app.getHttpServer()).get('/users/me').expect(200);
    });
  });
});
