import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-anonymous';
import { AuthProvider } from '../../core/entities';
import { CreateUserDto } from '../../users/dto';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async authenticate(): Promise<void> {
    const dto: CreateUserDto = {
      login: `guest-${uuidv4()}`,
      provider: AuthProvider.GUEST,
    };

    this.success(this.usersService.createUser(dto));
  }
}
