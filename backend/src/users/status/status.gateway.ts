import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users.service';
import { SessionEntity, UserStatus } from '../../core/entities';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  cookie: true,
})
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
  ) {}

  // Called when a client connects to the server
  async handleConnection(client: Socket) {
    const session = await this.sessionService.getSessionByClientSocket(client);
    if (!session) {
      return client.disconnect();
    }

    // A valid client connecting for the first time doesn't have the userId
    // We send the userId to the client so that it can authenticate
    if (!client.handshake.auth?.userId) {
      return client.emit('authSuccess', session.userId);
    }

    // Client is connected and authenticated
    if (client.handshake.auth?.userId === session.userId) {
      this.setUserOnline(client, session);
      this.emitUserStatus(session.userId, UserStatus.ONLINE);
    }
  }

  async setUserOnline(client: Socket, session: SessionEntity) {
    const updateSessionPromise = this.sessionService.updateSession(session.id, {
      socketId: client.id,
    });
    const updateUserPromise = this.userService.updateUser(session.userId, {
      status: UserStatus.ONLINE,
    });
    await Promise.all([updateSessionPromise, updateUserPromise]);
  }

  // Called when a client disconnects from the server
  async handleDisconnect(client: Socket) {
    const session = await this.sessionService.getSessionBySocketId(client.id);
    if (!session) {
      return;
    }

    const updateSessionPromise = this.sessionService.updateSession(session.id, {
      socketId: null,
    });
    const updateUserPromise = this.userService.updateUser(session.userId, {
      status: UserStatus.OFFLINE,
    });
    await Promise.all([updateSessionPromise, updateUserPromise]);

    this.emitUserStatus(session.userId, UserStatus.OFFLINE);
  }

  // Emit user status to all clients connected via websocket
  emitUserStatus(userId: number, status: string) {
    this.server.emit('userStatus', { id: userId, status });
  }
}
