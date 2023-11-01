import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../entities';

/**
 * User Decorator
 *
 * This decorator can be used in both HTTP controllers and WebSocket gateways to fetch user information.
 * It automatically detects the context (HTTP or WebSocket) and fetches the user accordingly.
 *
 * @param data Optional. If provided, it will return the specified property of the user object.
 * @param ctx The execution context.
 *
 * Usage:
 *
 * 1. To get the entire user object:
 *    @User() user: UserEntity
 *
 * 2. To get a specific property of the user object (e.g., 'id'):
 *    @User('id') id: number
 */
export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const type = ctx.getType();
  let user: UserEntity;

  if (type === 'http') {
    const request = ctx.switchToHttp().getRequest();
    user = request.user;
  } else if (type === 'ws') {
    const client = ctx.switchToWs().getClient();
    user = client.handshake.auth?.user;
  } else {
    return null;
  }

  return data ? user?.[data] : user;
});
