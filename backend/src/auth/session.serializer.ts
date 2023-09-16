import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { User } from '../core/entities';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error, user: any) => void): any {
    done(null, {
      id: user.id,
      provider: user.provider,
    });
  }

  async deserializeUser(
    user: any,
    done: (err: Error, user: User) => void,
  ): Promise<any> {
    await this.usersService
      .getUserById(user.id)
      .then((user) => {
        if (!user) {
          done(
            new NotFoundException(`User with ID '${user.id}' not found`),
            null,
          );
        } else {
          done(null, user);
        }
      })
      .catch((error) => {
        done(error, null);
      });
  }
}
