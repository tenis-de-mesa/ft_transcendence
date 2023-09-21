import { Test, TestingModule } from '@nestjs/testing';

describe('Class', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({}).compile();
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
