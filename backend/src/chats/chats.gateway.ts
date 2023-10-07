import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { Session } from '../core/entities';
import * as cookie from 'cookie';
import { SessionsService } from '../users/sessions/sessions.service';

interface NewChatMessage {
  chatId: string;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  cookie: true,
})
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatsService,
    private readonly sessionService: SessionsService,
  ) {}

  // When the cliend sends a message to the server
  @SubscribeMessage('sendChatMessage')
  async handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: NewChatMessage,
  ) {
    const session = await this.getSession(client);
    if (!session) return;

    const userId = session.userId;

    console.log(userId);

    const newMessage = await this.chatService.addMessage(
      userId,
      parseInt(data.chatId),
      data.message,
    );

    // Send the new message back to all clients
    this.server.emit('newMessage', newMessage);
  }

  // TODO: create decorator for get user from gateway
  // TODO: duplicated code of users.status.gateway
  async getSession(client: Socket): Promise<Session> {
    const sessionId = this.getSessionId(client);
    return await this.sessionService.getSessionById(sessionId);
  }

  getSessionId(client: Socket): string {
    const cookies = cookie.parse(client.handshake.headers.cookie || '');
    const sessionCookie = cookies['connect.sid'];
    return this.extractSessionId(sessionCookie);
  }

  extractSessionId(sessionId: string): string {
    if (!sessionId) return '';

    const prefixIndex = sessionId.indexOf(':');
    const dotIndex = sessionId.indexOf('.');
    return sessionId.substring(prefixIndex + 1, dotIndex);
  }
}
