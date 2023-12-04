import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenError } from 'passport-oauth2';

@Injectable()
export class IntraAuthGuard extends AuthGuard('intra') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request.isAuthenticated()) return true;
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);
    return result;
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    if (err || !user) {
      if (err instanceof TokenError) {
        throw new UnauthorizedException(err.message);
      }
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
