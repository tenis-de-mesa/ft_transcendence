import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User Decorator
 *
 * This decorator can be used in both HTTP controllers and WebSocket gateways to fetch user information.
 * It automatically detects the context (HTTP or WebSocket) and fetches the user accordingly.
 *
 * Usage:
 *
 * 1. To get the entire user object:
 *    @User() user: UserEntity
 *
 * 2. To get a specific property of the user object (e.g., 'email'):
 *    @User('email') email: string
 */
export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const type = ctx.getType();

  if (type === 'http') {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  } else if (type === 'ws') {
    const client = ctx.switchToWs().getClient();
    return data ? client.handshake.auth?.[data] : client.handshake.auth?.user;
  } else {
    return null;
  }
});
