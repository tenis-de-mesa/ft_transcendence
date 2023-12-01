import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  WsException,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { SessionsService } from '../users/sessions/sessions.service';
import { User } from '../core/decorators';
import { ChatMemberEntity, UserEntity } from '../core/entities';
import * as cookie from 'cookie';
import { UsersService } from '../users/users.service';
import { OnEvent } from '@nestjs/event-emitter';
import { GatewayChatEventDto } from './dto';
import { GatewaySocketManager, IGatewaySocketManager } from '../core/adapters';
import { Inject } from '@nestjs/common';

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
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatsService,
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,

    @Inject(GatewaySocketManager.name)
    private readonly sockets: IGatewaySocketManager,
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

  handleConnection(client: Socket) {
    const user = client.handshake.auth['user'];
    this.sockets.pushUserSocket(user.id, client);
  }

  handleDisconnect(client: Socket) {
    const user = client.handshake.auth['user'];
    this.sockets.deleteUserSocket(user.id);
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

  @OnEvent('chat.delete')
  async handleDeleteEvent(chatId: number) {
    this.server.to(`chat:${chatId}`).emit('chatDeleted', chatId);
  }

  @OnEvent('chat.kick')
  handleKickEvent(payload: GatewayChatEventDto) {
    const { userId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userRemoved', userId);
  }

  @OnEvent('chat.mute')
  handleMuteEvent(payload: GatewayChatEventDto) {
    const { userId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userMuted', userId);
  }

  @OnEvent('chat.unmute')
  handleUnmuteEvent(payload: GatewayChatEventDto) {
    const { userId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userUnmuted', userId);
  }

  @OnEvent('chat.ban')
  handleBanEvent(payload: GatewayChatEventDto) {
    const { userId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userBanned', userId);
  }

  @OnEvent('chat.unban')
  handleUnbanEvent(payload: GatewayChatEventDto) {
    const { userId, chatId } = payload;

    this.server.to(`chat:${chatId}`).emit('userUnbanned', userId);
  }

  @OnEvent('chat.updateMemberRole')
  handleUpdateMemberRoleEvent(member: ChatMemberEntity) {
    this.server.to(`chat:${member.chatId}`).emit('userRoleUpdated', member);
  }

  @OnEvent('chat.blocked')
  handleChatBlockedEvent(payload: {
    blockedUserId: number;
    blockingUserId: number;
  }) {
    const { blockedUserId, blockingUserId } = payload;
    const blockedUserSockets = this.sockets.getUserSockets(blockedUserId);
    const blockingUserSockets = this.sockets.getUserSockets(blockingUserId);

    if (blockedUserSockets) {
      blockedUserSockets.map((socket) => socket.emit('userBlocked', payload));
    }

    if (blockingUserSockets) {
      blockingUserSockets.map((socket) => socket.emit('userBlocked', payload));
    }
  }

  @OnEvent('chat.unblocked')
  handleChatUnblockedEvent(payload: {
    unblockedUserId: number;
    unblockingUserId: number;
  }) {
    const { unblockedUserId, unblockingUserId } = payload;
    const unblockedUserSockets = this.sockets.getUserSockets(unblockedUserId);
    const unblockingUserSockets = this.sockets.getUserSockets(unblockingUserId);

    if (unblockedUserSockets) {
      unblockedUserSockets.map((socket) =>
        socket.emit('userUnblocked', payload),
      );
    }

    if (unblockingUserSockets) {
      unblockingUserSockets.map((socket) =>
        socket.emit('userUnblocked', payload),
      );
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
}
