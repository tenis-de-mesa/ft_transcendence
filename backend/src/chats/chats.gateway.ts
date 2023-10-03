import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

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

  constructor(private readonly chatService: ChatsService) {}

  // When the cliend sends a message to the server
  @SubscribeMessage('sendChatMessage')
  async handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: NewChatMessage,
  ) {
    const newMessage = await this.chatService.addMessage(
      parseInt(data.chatId),
      data.message,
    );
    // Send the new message back to all clients
    this.server.emit('newMessage', newMessage);
  }
}
