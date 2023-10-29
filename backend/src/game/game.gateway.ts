import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../users/sessions/sessions.service';
// import { GetSessionId } from '../core/decorators/get-sessionid.decorator';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  cookie: true,
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  players: object;
  total_players: number;

  constructor(
    private readonly sessionService: SessionsService,
    private readonly gameService: GameService,
  ) {}

  afterInit(server: Server) {
    server;
    this.total_players = 0;
    this.players = {};
  }

  handleConnection(client: Socket) {
    console.log('Game connection:', client.id);
    this.players[client.id] = {};
    this.total_players++;
  }

  handleDisconnect(client: Socket) {
    console.log('Game disconnect:', client.id);
    this.players[client.id] = undefined;
    this.total_players--;
  }

  @SubscribeMessage('ping')
  async handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    console.log('ping', client.id);

    client.emit('pong', data);

    // this.server.emit('pong', data);
  }
}
