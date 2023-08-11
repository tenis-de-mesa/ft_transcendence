import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { IntraDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateIntraUser(dto: IntraDto): Promise<any> {
    let user = await this.usersService.getUserById(dto.id);

    if (!user) {
      user = await this.usersService.createUser(dto);
    }

    return user;
  }
}
