import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IntraDto } from '../auth/dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(dto: IntraDto): Promise<User> {
    console.log('UsersService::createUser()'); // TODO: Remove log line
    return await this.userRepository.save({
      id: dto.id,
      login: dto.login,
    });
  }

  async getUserById(id: number): Promise<User> {
    console.log('UsersService::getUserById()'); // TODO: Remove log line

    return await this.userRepository.findOneBy({ id }).then((user) => {
      if (!user) throw new NotFoundException(`User with ID '${id}' not found`);
      return user;
    });
  }
}
