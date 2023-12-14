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
import { ChatMemberEntity, MessageEntity, UserEntity } from '../core/entities';
import * as cookie from 'cookie';
import { UsersService } from '../users/users.service';
import { OnEvent } from '@nestjs/event-emitter';
import { GatewayChatEventDto } from './dto';

interface NewChatMessage {
  chatId: number;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: 'https://transcendence.ngrok.app',
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

  @OnEvent('chat.newMessage')
  handleNewMessageEvent(message: MessageEntity) {
    this.server.to(`chat:${message.chat.id}`).emit('newMessage', message);
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
