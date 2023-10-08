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
    @GetSessionId() sessionId: string,
    @MessageBody() data: NewChatMessage,
  ) {
    const session = await this.sessionService.getSessionById(sessionId);
    if (!session) return;

    const userId = session.userId;

    const newMessage = await this.chatService.addMessage(
      userId,
      parseInt(data.chatId),
      data.message,
    );

    // Send the new message back to all clients
    this.server.emit('newMessage', newMessage);
  }
}
