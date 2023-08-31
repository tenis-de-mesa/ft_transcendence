import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { Session } from '../core/entities';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // replace with your client's origin
    credentials: true,
  },
  cookie: true,
  middlewares: [
    function (socket, next) {
      // const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      // const sessionId = cookies['connect.sid'];
      // if (!sessionId) {
      //   return next(new Error('Authentication error'));
      // }
      // const prefixIndex = sessionId.indexOf(':');
      // const dotIndex = sessionId.indexOf('.');
      // const session = sessionId.substring(prefixIndex + 1, dotIndex);
      // socket.handshake.sessionID = session;
      console.log('middleware called');
      next();
    },
  ],
})
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const session = await this.getSession(client);
    const socketId = client.id;

    console.log('connected');
    console.log({ socketId });
    console.log({ session });

    if (session) {
      // Connect the user session with the socket id
      await this.sessionService.updateSession(session.id, {
        socketId: socketId,
      });
      // Update the user status to online
      await this.userService.updateUser(session.user_id, { status: 'online' });
      this.server.emit('userStatus', { id: session.user_id, status: 'online' });
    }
  }

  async handleDisconnect(client: Socket) {
    const session = await this.sessionService.getSessionBySocketId(client.id);

    console.log('disconnected');
    console.log({ session });

    if (session) {
      // Disconnect the user session from the socket id
      await this.sessionService.updateSession(session.id, { socketId: null });

      // Update the user status to offline
      await this.userService.updateUser(session.user_id, { status: 'offline' });
      this.server.emit('userStatus', {
        id: session.user_id,
        status: 'offline',
      });
    }
  }

  async getSession(client: Socket): Promise<Session> {
    const sessionId = this.getSessionId(client);
    const session = await this.sessionService.getSessionById(sessionId);
    return session;
  }

  getSessionId(client: Socket): string {
    const cookies = cookie.parse(client.handshake.headers.cookie || '');
    const sessionId = cookies['connect.sid'];
    if (!sessionId) {
      return '';
    }
    const prefixIndex = sessionId.indexOf(':');
    const dotIndex = sessionId.indexOf('.');
    return sessionId.substring(prefixIndex + 1, dotIndex);
  }
}
