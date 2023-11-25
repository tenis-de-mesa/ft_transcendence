import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserEntity } from '../../core/entities';

@Injectable()
export class TwoFactorDisabledGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    if (user.tfaEnabled) {
      throw new ForbiddenException(
        'Two factor authentication is already enabled',
      );
    }

    return true;
  }
}
