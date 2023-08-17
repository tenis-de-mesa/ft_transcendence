import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../core/entities';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.isAuthenticated()) {
      throw new UnauthorizedException();
    }

    if (request.url.includes('tfa/authenticate')) {
      return true;
    }

    const user: User = request.user;
    if (user.tfaEnabled) {
      if (!request.session.tfaAuthenticated) {
        throw new UnauthorizedException();
      }
    }
    return true;
  }
}
