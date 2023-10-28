import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Brackets, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
import {
  UserEntity,
  SessionEntity,
  AuthProvider,
  UserStatus,
} from '../core/entities';
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
    return await this.userRepository.find({ relations: { friends: true } });
  }

  async seedUsers(n: number): Promise<void> {
    for (let i = 1; i <= n; i++) {
      const user = new UserEntity();
      user.login = `testuser${i}`;
      user.nickname = `Test User ${i}`;
      user.provider = AuthProvider.GUEST;
      user.status = UserStatus.OFFLINE;
      await this.userRepository.save(user);
    }
  }

  async addFriend(currentUser: UserEntity, friendId: number): Promise<void> {
    if (currentUser.id == friendId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }
    const newFriend = await this.userRepository.findOne({
      where: { id: friendId },
    });
    if (!newFriend) {
      throw new BadRequestException('Friend not found');
    }
    const isAlreadyFriend = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.friends', 'friend')
      .where('user.id = :userId and friend.id = :friendId', {
        userId: currentUser.id,
        friendId,
      })
      .getOne();
    if (isAlreadyFriend) {
      throw new ConflictException('Friend already added');
    }
    // Add the new friend to the current user's list of friends
    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'friends')
      .of(currentUser.id)
      .add(friendId);
    // Add the current user to the new friend's list of friends
    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'friends')
      .of(friendId)
      .add(currentUser.id);
  }

  // this.usersService.deleteFriend(user, friendId);
  async deleteFriend(currentUser: UserEntity, friendId: number): Promise<void> {
    const friendToDelete = await this.userRepository.findOne({
      where: { id: friendId },
    });
    if (!friendToDelete) {
      throw new BadRequestException('Friend not found');
    }
    // Remove the friend from the current user's list of friends
    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'friends')
      .of(currentUser.id)
      .remove(friendId);
    // Remove the current user from the friend's list of friends
    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'friends')
      .of(friendId)
      .remove(currentUser.id);
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
    blockedById: number,
    blockedUserId: number,
  ): Promise<BlockListEntity> {
    if (blockedById === blockedUserId) {
      return null;
    }
    return await this.blockListRepository.save({ blockedById, blockedUserId });
  }

  async unblockUserById(
    blockedById: number,
    blockedUserId: number,
  ): Promise<void> {
    await this.blockListRepository.delete({ blockedById, blockedUserId });
  }

  async getBlockedUsers(blockedById: number): Promise<number[]> {
    const blockedUsers = await this.blockListRepository.findBy({ blockedById });
    return blockedUsers.map(({ blockedUserId }) => blockedUserId);
  }

  async getUsersWhoBlockedMe(blockedUserId: number): Promise<number[]> {
    const blockedBy = await this.blockListRepository.findBy({ blockedUserId });
    return blockedBy.map(({ blockedById }) => blockedById);
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
