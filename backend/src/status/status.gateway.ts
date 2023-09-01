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
    origin: 'http://localhost:3000',
    credentials: true,
  },
  cookie: true,
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

    if (session) {
      // Link the user session with the current socket id
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

    if (session) {
      // Unlink the user session with the current socket id
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
