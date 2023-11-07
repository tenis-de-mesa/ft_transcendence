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
import { Position2D } from './interfaces';

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
  MAXWIDTH = 700;
  MAXHEIGHT = 600;
  players: object;
  total_players: number;
  ball_x: number;
  ball_y: number;

  vecDirX = 1;
  vecDirY = 1;

  interval;

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
    const player: Player = { id: client.id, x: 0, y: 0 };
    this.players[client.id] = player;
    this.ball_x = this.MAXWIDTH / 2;
    this.ball_y = this.MAXHEIGHT / 2;

    this.total_players++;
    this.server.emit('ON_PLAYERS_UPDATE', this.players);

    this.interval = setInterval(() => {
      this.ball_x = this.ball_x + this.vecDirX;
      this.ball_y = this.ball_y + this.vecDirY;
      this.onBallUpdate();
    }, 100);
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

  @SubscribeMessage('ON_BALL_MOVE')
  async handleEventBallMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() movement: Move,
  ) {
    const move: Position2D = { x: this.MAXWIDTH / 2, y: this.MAXHEIGHT / 2 };
    this.server.emit('ON_BALL_UPDATE', move);
  }

  @SubscribeMessage('ping')
  async pingPong(@ConnectedSocket() client: Socket) {
    client.emit('pong');
  }

  async onBallUpdate() {
    if (this.ball_x > this.MAXWIDTH) {
      this.ball_x = this.MAXWIDTH;
      this.vecDirX = -this.vecDirX;
    }
    if (this.ball_x < 0) {
      this.ball_x = 0;
      this.vecDirX = -this.vecDirX;
    }
    if (this.ball_y > this.MAXHEIGHT) {
      this.ball_y = this.MAXHEIGHT;
      this.vecDirY = -this.vecDirY;
    }
    if (this.ball_y < 0) {
      this.ball_y = 0;
      this.vecDirY = -this.vecDirY;
    }
    const move: Position2D = { x: this.ball_x, y: this.ball_y };
    this.server.emit('ON_BALL_UPDATE', move);
  }
}
