import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthenticatedGuard, IntraAuthGuard } from '../src/auth/guards';

describe('e2e', () => {
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

    // delete entity:

    // const dataSource = app.get(DataSource);
    // await dataSource.createQueryBuilder().delete().from(/* Entity */).execute();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
  });

  it('test', async () => {
    // Arrange
    // Act
    // Assert
  });
});
