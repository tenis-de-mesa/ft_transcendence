import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../core/entities/user.entity';
import { IntraDto } from '../auth/dto';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: IntraDto): Promise<User> {
    return await this.userRepository.save({
      id: dto.id,
      login: dto.login,
    });
  }

  async getUserById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    return await this.userRepository.update(id, { ...dto });
  }
}
