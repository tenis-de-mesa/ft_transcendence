import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

describe('Class', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        // {
        //   provide: getRepositoryToken(/*Repository*/),
        //   useClass: Repository,
        // },
      ],
    }).compile();
  });

  it('should be defined', async () => {
    expect(module).toBeDefined();
  });

  describe('method', () => {
    it('test', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
