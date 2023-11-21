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
import { Ball, GameRoom, Player, Score, Direction } from './game.interface';
import { GameService } from './game.service';

@WebSocketGateway({
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

  games: any[]

  allUsers: Record<number, {
    user: UserEntity,
    client: Socket
  }>

  allClientSockets: Record<string, number>

  // 

  gameRooms: GameRoom[];
  serverTotalRooms: number;

  players: Record<string, Player | undefined>;
  serverTotalPlayers: number;

  windowWidth = 700;
  windowHeight = 600;

  interval: NodeJS.Timeout;

  constructor(
    private readonly sessionService: SessionsService,
    private readonly userService: UsersService,
    private readonly gameService: GameService
  ) {
    this.interval = setInterval(() => {
      // this.gameLoop();
      this.gameService.updateGame(this.server)


    }, 16);
    this.queues = {
      // all: []
      invites: []
      // open: []
    };
    this.games = []

    this.allUsers = {}
    this.allClientSockets = {}
  }

  afterInit(server: Server) {
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

  }

  handleConnection(clientSocket: Socket) {
    // TODO: not exists user?
    const user: UserEntity = clientSocket.handshake.auth?.user;

    console.log('Game: New client connection:', clientSocket.id, "userId", user.id);

    this.allUsers[user.id] = { client: clientSocket, user: user }

    this.allClientSockets[clientSocket.id] = user.id

    // let playerType: string;
    // if (this.serverTotalPlayers % 2 === 0) {
    //   playerType = 'left';
    // } else {
    //   playerType = 'right';
    // }

    // const newPlayerConnection: Player = {
    //   id: clientSocket.id,
    //   y: 0,
    //   playerType: playerType,
    // };

    // const newPlayerStringId: string = clientSocket.id;

    // this.players[newPlayerStringId] = newPlayerConnection;
    // this.serverTotalPlayers++;

    // this.addPlayerToRoom(newPlayerConnection);

    // this.server.emit('socketConnection', this.players);
    // clientSocket.emit('playerConnection', newPlayerConnection.id);

    // this.server.emit('ballPosition', this.ball);
  }

  handleDisconnect(clientSocket: Socket) {
    const userId = this.allClientSockets[clientSocket.id]

    console.log('Client disconnected:', clientSocket.id, 'userId', userId);

    delete this.allUsers[userId]
    delete this.allClientSockets[clientSocket.id]

    // const playerStringId: string = clientSocket.id;
    // this.players[playerStringId] = undefined;
    // this.serverTotalPlayers--;

    // this.removePlayerFromRoom(playerStringId);

    // this.server.emit('socketConnection', this.players);
    // clientSocket.emit('playerDisconnection', playerStringId);
  }

  // addPlayerToRoom(player: Player) {
  //   const availableRoom = this.gameRooms.find(
  //     (room) => room.players.length < 2,
  //   );

  //   if (availableRoom) {
  //     availableRoom.players.push(player);
  //   } else {
  //     const newRoom: GameRoom = {
  //       id: this.gameRooms.length + 1,
  //       players: [player],
  //     };

  //     this.gameRooms.push(newRoom);
  //     this.serverTotalRooms++;
  //   }
  // }

  // removePlayerFromRoom(playerId: string) {
  //   for (const room of this.gameRooms) {
  //     const playerIndex = room.players.findIndex(
  //       (player) => player.id === playerId,
  //     );

  //     if (playerIndex !== -1) {
  //       room.players.splice(playerIndex, 1);

  //       if (room.players.length === 0) {
  //         const roomIndex = this.gameRooms.findIndex((r) => r.id === room.id);
  //         this.gameRooms.splice(roomIndex, 1);
  //       }

  //       break;
  //     }
  //   }
  // }

  // gameLoop() {
  //   for (const game of this.games) {
  //     game.gameLoop()
  //     const room = game.game.id
  //     const x = game.game.ball.x
  //     const y = game.game.ball.y
  //     this.server.to(room).emit('updateBallPosition', { x, y });
  //   }
  // }

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

  @SubscribeMessage('acceptInvitePlayerToGame')
  async handleAcceptInvitePlayerToGame(
    @ConnectedSocket() clientSocket: Socket,
    @User('id') userId: number,
    @MessageBody() userIdInvitation: number
  ) {
    const match = this.queues.invites.find((i) => i.guest.id == userId && i.user.id == userIdInvitation)
    if (!match) {
      return
    }
    this.queues.invites = this.queues.invites.filter((i) => !(i.guest.id == userId && i.user.id == userIdInvitation))

    const game = await this.gameService.newGame(match.user, match.guest)

    this.allUsers[match.user.id].client.emit('gameAvailable', game.id)
    clientSocket.emit('gameAvailable', game.id)
  }

  @SubscribeMessage('findMyInvites')
  handleFindMyInvites(@ConnectedSocket() clientSocket: Socket,
    @MessageBody() player: any,
    @User('id') userId: number) {
    const response = this.queues.invites.filter((i) => i.guest.id == userId).map((i) => i.user);
    return response
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

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: number,
  ) {
    client.join(`game:${gameId}`);
    const game = this.gameService.games[gameId]
    return game;
  }


  @SubscribeMessage('movePlayer')
  async handlePlayerMovement(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() direction: Direction,
    @User('id') userId: number,
  ) {
    console.log("ClientSocket");
    console.log(clientSocket);
    console.log("ClientSocket.rooms");
    console.log(clientSocket.rooms);
    const playerId = clientSocket.id;

    const gameIndex = this.games.findIndex((i) => i.game.players[0].userId == userId || i.game.players[1].userId == userId)

    const position = this.games[gameIndex].game.players[0].userId == userId ? 0 : 1

    if (direction.up) {
      if (this.games[gameIndex].game.players[position].y < 10) {
        this.games[gameIndex].game.players[position].y = 0;
      } else {
        this.games[gameIndex].game.players[position].y -= 10;
      }
    }
    if (direction.down) {
      if (this.games[gameIndex].game.players[position].y > this.windowHeight - 100 - 10) {
        this.games[gameIndex].game.players[position].y = this.windowHeight - 100;
      } else {
        this.games[gameIndex].game.players[position].y += 10;
      }
    }

    this.server.to(this.games[gameIndex].game.id).emit('updatePlayerPosition', {
      playerId,
      position: this.games[gameIndex].game.players[position],
    });
  }
}
