import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users.service';
import { SessionEntity, UserEntity, UserStatus } from '../../core/entities';
import { User } from '../../core/decorators';

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
    const session: SessionEntity =
      await this.sessionService.getSessionByClientSocket(client);
    // If the client is not authenticated, disconnect it
    if (!session) {
      return client.disconnect();
    }
    // Check if the user id in the auth token matches the user id in the session
    if (client.handshake.auth.user.id !== session.userId) {
      return client.disconnect();
    }
    // Link the socket id to the session
    const updateSessionPromise = this.sessionService.updateSession(session.id, {
      socketId: client.id,
    });
    // Update the user status to online
    const updateUserPromise = this.userService.updateUser(session.userId, {
      status: UserStatus.ONLINE,
    });
    await Promise.all([updateSessionPromise, updateUserPromise]);
    this.emitUserStatus(session.userId, UserStatus.ONLINE);
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

  @SubscribeMessage('playerInGame')
  async handlePlayerInGame(@User() user: UserEntity) {
    await this.userService.updateUser(user.id, {
      status: UserStatus.IN_GAME,
    });
    this.emitUserStatus(user.id, UserStatus.IN_GAME);
  }

  @SubscribeMessage('playerLeftGame')
  async handlePlayerLeftGame(@User() user: UserEntity) {
    this.userService.updateUser(user.id, {
      status: UserStatus.ONLINE,
    });
    this.emitUserStatus(user.id, UserStatus.ONLINE);
  }

  // Emit user status to all clients connected via websocket
  emitUserStatus(userId: number, status: string) {
    this.server.emit('userStatus', { id: userId, status });
  }
}
