import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from '../../core/entities';

@Injectable()
export class TwoFactorDisabledGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (user.tfaEnabled) {
      throw new ForbiddenException('Two factor authentication is enabled');
    }

    return true;
  }
}
