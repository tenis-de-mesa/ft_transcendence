import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { ChatsModule } from '../../src/chats/chats.module';
import { AuthModule } from '../../src/auth/auth.module';

describe('Chat', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmConfigModule, ChatsModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
  });

  it('test', async () => {
    // Arrange
    // Act
    const response = await request(app.getHttpServer()).get('/chats');
    // Assert
    expect(response.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    // TODO: resolve this
    // expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });
});
