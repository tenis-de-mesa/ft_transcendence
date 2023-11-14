import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  WsException,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { SessionsService } from '../users/sessions/sessions.service';
import { User } from '../core/decorators';
import { UserEntity } from '../core/entities';
import * as cookie from 'cookie';
import { UsersService } from '../users/users.service';
import { OnEvent } from '@nestjs/event-emitter';

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
export class ChatsGateway implements OnGatewayInit {
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

    this.server.to(`chat:${data.chatId}`).emit('newMessage', newMessage);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: number,
  ) {
    client.join(`chat:${chatId}`);
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: number,
  ) {
    client.leave(`chat:${chatId}`);
  }

  @SubscribeMessage('addUserToChat')
  async handleAddUserToChat(
    @User('id') userId: number,
    @MessageBody() chatId: number,
  ) {
    const member = await this.chatService.getMember(chatId, userId);

    this.server.to(`chat:${chatId}`).emit('userAdded', member);
  }

  @SubscribeMessage('removeUserFromChat')
  async handleRemoveUserFromChat(
    @User('id') userId: number,
    @MessageBody() chatId: number,
  ) {
    this.server.to(`chat:${chatId}`).emit('userRemoved', userId);
  }

  @OnEvent('chat.kick')
  handleKickEvent(payload: { kickUserId: number; chatId: number }) {
    const { kickUserId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userRemoved', kickUserId);
  }

  @OnEvent('chat.mute')
  handleMuteEvent(payload: {
    userId: number;
    muteUserId: number;
    muteDuration: number;
    chatId: number;
  }) {
    const { userId, muteUserId, muteDuration, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userMuted', muteUserId);

    setTimeout(() => {
      this.chatService.unmuteMember(chatId, userId, muteUserId);
      this.server.to(`chat:${chatId}`).emit('userUnmuted', muteUserId);
    }, muteDuration);
  }

  @OnEvent('chat.unmute')
  handleUnuteEvent(payload: { unmuteUserId: number; chatId: number }) {
    const { unmuteUserId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userUnmuted', unmuteUserId);
  }

  @OnEvent('chat.ban')
  handleBanEvent(payload: { banUserId: number; chatId: number }) {
    const { banUserId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userBanned', banUserId);
  }

  @OnEvent('chat.unban')
  handleUnbanEvent(payload: { unbanUserId: number; chatId: number }) {
    const { unbanUserId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userUnbanned', unbanUserId);
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
