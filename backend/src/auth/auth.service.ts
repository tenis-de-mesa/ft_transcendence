import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { AuthProvider, UserEntity } from '../core/entities';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async loginAsIntra(dto: CreateUserDto): Promise<UserEntity> {
    let user = await this.usersService.getUserByIntraId(dto.intraId);

    if (!user) {
      user = await this.usersService.createUser(dto);
    }

    return user;
  }

  async logout(req: Request, res: Response): Promise<void> {
    const user = req.user as UserEntity;

    if (!user) {
      res.redirect('back');
      return;
    }

    if (user.provider === AuthProvider.GUEST) {
      this.usersService.deleteUser(user.id);
    }

    req.session.destroy(function () {
      res
        .clearCookie('connect.sid', {
          path: '/',
        })
        .redirect('back');
    });
  }
}
