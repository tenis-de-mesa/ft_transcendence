import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  WsException,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { SessionsService } from '../users/sessions/sessions.service';
import { User } from '../core/decorators';
import { UserEntity } from '../core/entities';
import * as cookie from 'cookie';
import { UsersService } from '../users/users.service';

interface NewChatMessage {
  chatId: number;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  cookie: true,
})
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatsService,
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
  ) {}

  afterInit(_server: Server) {
    this.server.use((socket, next) => {
      this.validate(socket)
        .then((user) => {
          socket.handshake.auth['user'] = user;
          next();
        })
        .catch((error) => next(error));
    });
  }

  async handleConnection(client: Socket) {
    const user: UserEntity = client.handshake.auth['user'];
    const chats = await this.chatService.findAll(user);

    for (const chat of chats) {
      client.join(`chat:${chat.id}`);
    }
  }

  // When the client sends a message to the server
  @SubscribeMessage('sendChatMessage')
  async handleEvent(
    @User() user: UserEntity,
    @MessageBody() data: NewChatMessage,
  ) {
    const newMessage = await this.chatService.addMessage({
      content: data.message,
      senderId: user.id,
      chatId: data.chatId,
    });

    // Send the new message back to all clients
    this.server.emit('newMessage', newMessage);
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @User() user: UserEntity,
    @MessageBody() chatId: number,
  ) {
    client.join(`chat:${chatId}`);
    this.server.to(`chat:${chatId}`).emit('userJoined', user);
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @User() user: UserEntity,
    @MessageBody() chatId: number,
  ) {
    client.leave(`chat:${chatId}`);
    this.server.to(`chat:${chatId}`).emit('userLeft', user);
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
}
