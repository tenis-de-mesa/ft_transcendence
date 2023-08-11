import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { IntraDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateIntraUser(dto: IntraDto): Promise<any> {
    console.log('AuthService::validateIntraUser()'); // TODO: Remove log line

    let user = await this.usersService.getUserById(dto.id);

    if (!user) {
        user = await this.usersService.createUser(dto);
    }

    return user;
  }
}
