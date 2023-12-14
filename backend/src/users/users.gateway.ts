import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../users/sessions/sessions.service';
import { UserEntity } from '../core/entities';
import * as cookie from 'cookie';
import { UsersService } from '../users/users.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatWithName } from '../chats/dto';

@WebSocketGateway({
  cors: {
    origin: 'https://transcendence.ngrok.app',
    credentials: true,
  },
  cookie: true,
})
export class UsersGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly sessionService: SessionsService,
    private readonly userService: UsersService,
  ) {}

  afterInit() {
    this.server.use((socket, next) => {
      this.validate(socket)
        .then((user) => {
          socket.handshake.auth['user'] = user;
          next();
        })
        .catch((error) => next(error));
    });
  }

  handleConnection(client: Socket) {
    const user: UserEntity = client.handshake.auth['user'];

    if (user) {
      client.join(`user:${user.id}`);
    }
  }

  private async validate(client: Socket) {
    const cookies = cookie.parse(client.handshake.headers.cookie);
    const sid = cookies['connect.sid'].split('.')[0].slice(2);

    try {
      const session = await this.sessionService.getSessionById(sid);
      return await this.userService.getUserById(session.userId);
    } catch (error) {
      throw new WsException('Unauthorized connection');
    }
  }

  @OnEvent('users.update')
  async handleUsersUpdateEvent(userId: number) {
    const data = await this.userService.getUserData(userId);
    this.server.to(`user:${userId}`).emit('currentUserData', data);
  }

  @OnEvent('users.newChat')
  async handleNewChat(userId: number, chat: ChatWithName) {
    this.server.to(`user:${userId}`).emit('newChat', chat);
  }
}
