import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../src/config/typeorm-config.module';

describe('Class', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmConfigModule],
    }).compile();
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

  describe('method', () => {
    it('test', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
