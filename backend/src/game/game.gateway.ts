import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../users/sessions/sessions.service';
import { UserEntity } from '../core/entities';
import { User } from '../core/decorators';
import * as cookie from 'cookie';
import { UsersService } from '../users/users.service';

type Player = {
  id: string;
  y: number;
  playerType: string;
};

interface Ball {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  radius: number;
}

interface GameRoom {
  id: number;
  players: Player[];
}

type Direction = {
  up: boolean;
  down: boolean;
};

interface Score {
  playerOne: number;
  playerTwo: number;
}

@WebSocketGateway({
  namespace: 'games',
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  cookie: true,
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  queues: {
    // all: []
    invites: {
      user: UserEntity,
      guest: UserEntity
    }[]
    // open: []
  };

  gameRooms: GameRoom[];
  serverTotalRooms: number;

  players: Record<string, Player | undefined>;
  serverTotalPlayers: number;

  windowWidth = 700;
  windowHeight = 600;

  ball: Ball;
  score: Score;

  interval: NodeJS.Timeout;

  constructor(
    private readonly sessionService: SessionsService,
    private readonly userService: UsersService
  ) {
    this.interval = setInterval(() => {
      this.gameLoop();
    }, 16);
    this.queues = {
      // all: []
      invites: []
      // open: []
    };
  }

  afterInit(server: Server) {
    console.log(this.queues)
    this.server.use((socket, next) => {
      this.validate(socket)
        .then((user) => {
          socket.handshake.auth['user'] = user;
          next();
        })
        .catch((error) => next(error));
    });

    this.gameRooms = [];
    this.serverTotalRooms = 0;

    this.players = {};
    this.serverTotalPlayers = 0;

    this.ball = {
      x: this.windowWidth / 2,
      y: this.windowHeight / 2,
      speedX: 4,
      speedY: 4,
      radius: 16,
    };

    this.score = {
      playerOne: 0,
      playerTwo: 0,
    };
  }

  handleConnection(clientSocket: Socket) {
    console.log('Game: New client connection:', clientSocket.id);
    // return;

    let playerType: string;
    if (this.serverTotalPlayers % 2 === 0) {
      playerType = 'left';
    } else {
      playerType = 'right';
    }

    const newPlayerConnection: Player = {
      id: clientSocket.id,
      y: 0,
      playerType: playerType,
    };

    const newPlayerStringId: string = clientSocket.id;

    this.players[newPlayerStringId] = newPlayerConnection;
    this.serverTotalPlayers++;

    this.addPlayerToRoom(newPlayerConnection);

    this.server.emit('socketConnection', this.players);
    clientSocket.emit('playerConnection', newPlayerConnection.id);

    // this.server.emit('ballPosition', this.ball);
  }

  handleDisconnect(clientSocket: Socket) {
    console.log('Client disconnected:', clientSocket.id);

    const playerStringId: string = clientSocket.id;
    this.players[playerStringId] = undefined;
    this.serverTotalPlayers--;

    this.removePlayerFromRoom(playerStringId);

    this.server.emit('socketConnection', this.players);
    clientSocket.emit('playerDisconnection', playerStringId);
  }

  addPlayerToRoom(player: Player) {
    const availableRoom = this.gameRooms.find(
      (room) => room.players.length < 2,
    );

    if (availableRoom) {
      availableRoom.players.push(player);
    } else {
      const newRoom: GameRoom = {
        id: this.gameRooms.length + 1,
        players: [player],
      };

      this.gameRooms.push(newRoom);
      this.serverTotalRooms++;
    }
  }

  removePlayerFromRoom(playerId: string) {
    for (const room of this.gameRooms) {
      const playerIndex = room.players.findIndex(
        (player) => player.id === playerId,
      );

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          const roomIndex = this.gameRooms.findIndex((r) => r.id === room.id);
          this.gameRooms.splice(roomIndex, 1);
        }

        break;
      }
    }
  }

  gameLoop() {
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;

    if (this.ball.x <= 0 || this.ball.x >= this.windowWidth) {
      this.ball.speedX = -this.ball.speedX;
    }

    if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
      this.ball.speedY = -this.ball.speedY;
    }

    for (const playerId in this.players) {
      const player = this.players[playerId];

      if (player) {
        let playerX: number;
        if (player.playerType === 'left') {
          playerX = 10;
        } else if (player.playerType === 'right') {
          playerX = this.windowWidth - 20;
        }
        const playerY = player.y;

        const playerWidth = 10;
        const playerHeight = 100;

        const ballInXRange =
          this.ball.x + this.ball.radius > playerX &&
          this.ball.x - this.ball.radius < playerX + playerWidth;

        const ballInYRange =
          this.ball.y + this.ball.radius > playerY &&
          this.ball.y - this.ball.radius < playerY + playerHeight;

        if (ballInXRange && ballInYRange) {
          this.ball.speedX = -this.ball.speedX;
        }
      }
    }

    this.server.emit('updateBallPosition', { x: this.ball.x, y: this.ball.y });
  }

  @SubscribeMessage('invitePlayerToGame')
  async handleInvitePlayerToGame(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() guestId: number,
    @User() user: UserEntity,
  ) {
    if (this.queues.invites.find((i) => i.guest.id == guestId)) {
      return
    }

    const guest = await this.userService.getUserById(guestId)

    this.queues.invites.push({
      guest,
      user
    });
  }

  @SubscribeMessage('findMyInvites')
  handleFindMyInvites(@ConnectedSocket() clientSocket: Socket,
  @MessageBody() player: any,
  @User('id') userId: number) {
    const response = this.queues.invites.filter((i) => i.guest.id == userId).map((i) => i.user);    
    clientSocket.emit("listInvites", response);
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

  @SubscribeMessage('movePlayer')
  async handlePlayerMovement(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() direction: Direction,
  ) {
    const playerId = clientSocket.id;

    if (direction.up) {
      if (this.players[playerId].y < 10) {
        this.players[playerId].y = 0;
      } else {
        this.players[playerId].y -= 10;
      }
    }
    if (direction.down) {
      if (this.players[playerId].y > this.windowHeight - 100 - 10) {
        this.players[playerId].y = this.windowHeight - 100;
      } else {
        this.players[playerId].y += 10;
      }
    }

    this.server.emit('updatePlayerPosition', {
      playerId,
      position: this.players[playerId],
    });
  }
}
