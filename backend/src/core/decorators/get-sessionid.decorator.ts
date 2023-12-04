import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { getSessionIdFromSocket } from '../utils/get-sessionid-from-socket.utils';

export const GetSessionId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client: Socket = ctx.switchToWs().getClient();
    return getSessionIdFromSocket(client);
  },
);
