import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { AuthProvider, UserEntity } from '../core/entities';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async loginAsIntra(dto: CreateUserDto): Promise<UserEntity> {
    const { intraId } = dto;

    try {
      return await this.usersService.getUserByIntraId(intraId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return await this.usersService.createUser(dto);
      }

      throw error;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const user = req.user as UserEntity;

    if (!user) {
      res.redirect('https://transcendence.ngrok.app/');
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
