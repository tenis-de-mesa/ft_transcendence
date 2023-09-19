import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IntraDto } from '../auth/dto';
import { UpdateUserDto } from './dto';
import { User, Session } from '../core/entities';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async createUser(dto: IntraDto): Promise<User> {
    let nickname = dto.login;

    while (!(await this.checkNicknameAvailable(nickname))) {
      nickname = dto.login + '-1';
    }

    return await this.userRepository.save({
      id: dto.id,
      login: dto.login,
      nickname,
    });
  }

  async getUserById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async checkNicknameAvailable(nickname: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ nickname });
    return !user ? true : false;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UpdateResult> {
    return await this.userRepository.update(id, { ...dto });
  }

  async updateAvatar(
    user: User,
    file: Express.Multer.File,
  ): Promise<UpdateResult> {
    const dirPath = path.join('./public/avatars', user.login);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, file.originalname);
    await fs.promises.writeFile(filePath, file.buffer);
    if (user.avatarPath) {
      const avatarPath = path.join('public', user.avatarPath);
      try {
        await fs.promises.access(avatarPath);
        await fs.promises.unlink(avatarPath);
      } catch (error) {
        console.error(`Error deleting avatar: ${error}`);
      }
    }
    // remove the inicial /public/ from the path
    const avatarPath = filePath.slice(7);
    return await this.userRepository.update(user.id, {
      avatarPath: avatarPath,
    });
  }

  async killAllSessionsByUserId(
    userId: number,
    exceptIds: string[] = [],
  ): Promise<DeleteResult> {
    const query = this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('user_id = :userId', { userId });

    if (exceptIds.length > 0) {
      query.andWhere('id NOT IN (:...except)', { except: exceptIds });
    }

    return await query.execute();
  }

  async getUserFriends(user: User): Promise<User[]> {
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
