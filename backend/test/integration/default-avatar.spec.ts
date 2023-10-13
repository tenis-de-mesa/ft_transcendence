import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigModule } from '../../src/config/typeorm-config.module';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { AuthProvider, UserEntity } from '../../src/core/entities';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

describe('Default Avatar', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let s3Client: S3Client;
  let userEntity: UserEntity;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmConfigModule, UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = app.get(UsersService);
    s3Client = app.get(S3Client);

    await app.init();

    userEntity = await usersService.createUser({
      login: 'test',
      provider: AuthProvider.INTRA,
      intraId: 1,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(usersService).toBeDefined();
    expect(s3Client).toBeDefined();
    expect(userEntity).toBeDefined();
  });

  it('default', async () => {
    // Arrange
    // Act
    // Assert
    expect(userEntity.avatarUrl).toEqual(null);
  });

  it('set avatar', async () => {
    // Arrange
    const file = {
      originalname: 'file.txt',
      mimetype: 'text/plain',
      // path: '/tmp/file.txt',
      buffer: Buffer.from('content'),
    } as Express.Multer.File;

    let imageKey = null;

    const s3ClientMock = jest
      .spyOn(s3Client, 'send')
      .mockImplementationOnce(async (command: PutObjectCommand) => {
        imageKey = command.input.Key;
        return null;
      });

    // Act
    await usersService.updateAvatar(userEntity, file);
    const user = await usersService.getUserById(userEntity.id);
    // Assert
    expect(s3ClientMock).toBeCalled();
    expect(imageKey).toEqual(user.id + file.originalname);
    expect(user.avatarUrl).toEqual(
      `https://transcendence.s3.amazonaws.com/${imageKey}`,
    );
  });
});
