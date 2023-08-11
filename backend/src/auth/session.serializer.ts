import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error, id: number) => void): any {
    done(null, user.id);
  }

  async deserializeUser(
    id: number,
    done: (err: Error, user: User) => void,
  ): Promise<any> {
    await this.usersService
      .getUserById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  }
}
