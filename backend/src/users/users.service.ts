import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { s3Client } from '../lib/aws/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Brackets, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserEntity, Session, AuthProvider } from '../core/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
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
    await Promise.all([
      this.killAllSessionsByUserId(id),
      this.userRepository.delete(id),
    ]);
  }

  async killAllSessionsByUserId(
    userId: number,
    exceptIds: string[] = [],
  ): Promise<DeleteResult> {
    const query = this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
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
      Bucket: 'transcendence-images',
      Key: imageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3Client.send(command);
    return await this.userRepository.update(user.id, {
      avatarUrl: `https://transcendence-images.s3.amazonaws.com/${imageKey}`,
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
