import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { User } from '../core/entities';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async loginAsIntra(dto: CreateUserDto): Promise<User> {
    let user = await this.usersService.getUserByIntraId(dto.intraId);

    if (!user) {
      user = await this.usersService.createUser(dto);
    }

    return user;
  }
}
