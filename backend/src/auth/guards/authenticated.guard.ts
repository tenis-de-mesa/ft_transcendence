import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('AuthenticatedGuard::canActivate()'); // TODO: Remove log line
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}
