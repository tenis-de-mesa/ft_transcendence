import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GuestGuard extends AuthGuard('guest') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request.isAuthenticated()) return true;
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);
    return result;
  }
}
