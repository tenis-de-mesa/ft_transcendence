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

type Player = {
  id: string;
  x: number;
  y: number;
};

type Move = {
  id: number;
  move: {
    x: number;
    y: number;
  };
};

@WebSocketGateway({
  namespace: 'games',
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
  MAXHEIGHT = 600;
  players: object;
  total_players: number;
  // gameLoop = setInterval(() => {
  //   this.server.emit('ON_PLAYERS_UPDATE', this.players);
  // }, 1500);

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
    console.log(client.handshake.auth);
    console.log('Game connection:', client.id);
    const player: Player = { id: client.id, x: 0, y: 0 };
    this.players[client.id] = player;
    this.total_players++;

    this.server.emit('ON_PLAYERS_UPDATE', this.players);
  }

  handleDisconnect(client: Socket) {
    console.log('Game disconnect:', client.id);
    this.players[client.id] = undefined;
    this.total_players--;

    this.server.emit('ON_PLAYERS_UPDATE', this.players);
  }

  @SubscribeMessage('ON_PLAYER_MOVE')
  async handleEventMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() movement: Move,
  ) {
    const player = this.players[client.id];

    player.x = player.x + (movement.move.x || 0);
    player.y = player.y + (movement.move.y || 0);
    if (player.y > this.MAXHEIGHT) {
      player.y = this.MAXHEIGHT;
    }

    this.server.emit('ON_PLAYERS_UPDATE', this.players);
  }

  @SubscribeMessage('ping')
  async pingPong(@ConnectedSocket() client: Socket) {
    client.emit('pong');
  }
}
