import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { SessionsService } from '../users/sessions/sessions.service';
import { GetSessionId } from '../core/decorators/get-sessionid.decorator';

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
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatsService,
    private readonly sessionService: SessionsService,
  ) {}

  // When the client sends a message to the server
  @SubscribeMessage('sendChatMessage')
  async handleEvent(
    @GetSessionId() sessionId: string,
    @MessageBody() data: NewChatMessage,
  ) {
    const session = await this.sessionService.getSessionById(sessionId);

    if (!session) {
      return;
    }

    const newMessage = await this.chatService.addMessage({
      content: data.message,
      senderId: session.userId,
      chatId: data.chatId,
    });

    // Send the new message back to all clients
    this.server.emit('newMessage', newMessage);
  }
}
