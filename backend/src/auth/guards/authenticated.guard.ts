import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from '../../core/entities';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.isAuthenticated()) {
      throw new UnauthorizedException('User is not logged in');
    }

    if (request.url.includes('tfa/authenticate')) {
      return true;
    }

    const user = request.user as UserEntity;
    if (user.tfaEnabled && !request.session.tfaAuthenticated) {
      throw new UnauthorizedException('User is not authenticated with 2FA');
    }
    return true;
  }
}
