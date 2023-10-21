import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Brackets, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserEntity, SessionEntity, AuthProvider } from '../core/entities';
import { BlockListEntity } from '../core/entities/blockList.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(BlockListEntity)
    private readonly blockListRepository: Repository<BlockListEntity>,
    @Inject(S3Client) private readonly s3Client: S3Client,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    let nickname = dto.login;

    while (!(await this.checkNicknameAvailable(nickname))) {
      nickname = dto.login + '-1';
    }

    return await this.userRepository.save({ ...dto, nickname });
  }

  async getUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ id: id });
  }

  async getUserByIntraId(id: number): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ intraId: id });
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UpdateResult> {
    return await this.userRepository.update(id, { ...dto });
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async blockUserById(
    userId: number,
    userBlockedId: number,
  ): Promise<BlockListEntity> {
    if (userId === userBlockedId) {
      return null;
    }
    return await this.blockListRepository.save({ userId, userBlockedId });
  }

  async unblockUserById(userId: number, userBlockedId: number): Promise<void> {
    await this.blockListRepository.delete({ userId, userBlockedId });
  }

  async killAllSessionsByUserId(
    userId: number,
    exceptIds: string[] = [],
  ): Promise<DeleteResult> {
    const query = this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(SessionEntity)
      .where('userId = :userId', { userId });

    if (exceptIds.length > 0) {
      query.andWhere('id NOT IN (:...except)', { except: exceptIds });
    }

    return await query.execute();
  }

  async findObsoleteGuestUsers(): Promise<UserEntity[]> {
    // Query to find guest users that have expired sessions
    // or no sessions at all attached to them
    const guestUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.provider = :provider', { provider: AuthProvider.GUEST })
      .leftJoin('user.sessions', 'session')
      .andWhere(
        new Brackets((qb) => {
          qb.where('session.expiredAt <= :currentTime', {
            currentTime: Date.now(),
          }).orWhere('session.id IS NULL');
        }),
      )
      .getMany();

    return guestUsers;
  }

  async checkNicknameAvailable(nickname: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ nickname });
    return !user ? true : false;
  }

  async updateAvatar(
    user: UserEntity,
    file: Express.Multer.File,
  ): Promise<UpdateResult> {
    const imageKey = user.id + file.originalname;
    const command = new PutObjectCommand({
      Bucket: 'transcendence',
      Key: imageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3Client.send(command);
    return await this.userRepository.update(user.id, {
      avatarUrl: `https://transcendence.s3.amazonaws.com/${imageKey}`,
    });
  }

  async getUserFriends(user: UserEntity): Promise<UserEntity[]> {
    const _user = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        friends: true,
      },
    });

    return _user.friends;
  }
}
