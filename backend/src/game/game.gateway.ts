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
  @WebSocketServer() server: Server;

  queues: {
    all: UserEntity[];
    invites: {
      user: UserEntity;
      guest: UserEntity;
    }[];
    // open: []
  };

  allUsers: Record<
    number,
    {
      user: UserEntity;
      client: Socket;
    }
  >;

  allClientSockets: Record<string, number>;

  interval: NodeJS.Timeout;

  constructor(
    private readonly sessionService: SessionsService,
    private readonly userService: UsersService,
    private readonly gameService: GameService,
  ) {
    this.interval = setInterval(() => {
      this.matchmaking();
      this.gameService.updateGame();
    }, 16);
    this.queues = {
      all: [],
      invites: [],
      // open: []
    };

    this.allUsers = {};
    this.allClientSockets = {};
  }

  afterInit() {
    this.server.use((socket, next) => {
      this.validate(socket)
        .then((user) => {
          socket.handshake.auth['user'] = user;
          next();
        })
        .catch((error) => next(error));
    });
    this.gameService.setServer(this.server);
  }

  handleConnection(clientSocket: Socket) {
    // TODO: not exists user?
    const user: UserEntity = clientSocket.handshake.auth?.user;

    this.allUsers[user.id] = { client: clientSocket, user: user };

    this.allClientSockets[clientSocket.id] = user.id;
  }

  handleDisconnect(clientSocket: Socket) {
    const userId = this.allClientSockets[clientSocket.id];

    delete this.allUsers[userId];
    delete this.allClientSockets[clientSocket.id];
  }

  async matchmaking() {
    if (this.queues.all.length < 2) {
      return;
    }

    const [playerOne, playerTwo] = this.queues.all.splice(0, 2);

    const game = await this.gameService.newGame(playerOne, playerTwo);

    this.allUsers[playerOne.id].client.emit('gameAvailable', game.gameId);
    this.allUsers[playerTwo.id].client.emit('gameAvailable', game.gameId);
  }

  @SubscribeMessage('findGame')
  handleFindGame(@User() user: UserEntity) {
    if (this.queues.all.find((u) => u.id == user.id)) {
      return;
    }

    this.queues.all.push(user);
  }

  @SubscribeMessage('cancelFindGame')
  handleCancelFindGame(@User() user: UserEntity) {
    this.queues.all = this.queues.all.filter((u) => u.id != user.id);
  }

  @SubscribeMessage('inFindGameQueue')
  handleFindGameQueue(@User() user: UserEntity): boolean {
    return Boolean(this.queues.all.find((u) => u.id == user.id));
  }

  @SubscribeMessage('invitePlayerToGame')
  async handleInvitePlayerToGame(
    @MessageBody() guestId: number,
    @User() user: UserEntity,
  ) {
    if (this.queues.invites.find((i) => i.guest.id == guestId)) {
      return;
    }

    const guest = await this.userService.getUserById(guestId);

    this.queues.invites.push({
      guest,
      user,
    });

    this.sendUpdateInviteList(guest.id);
  }

  @SubscribeMessage('acceptInvitePlayerToGame')
  async handleAcceptInvitePlayerToGame(
    @ConnectedSocket() clientSocket: Socket,
    @User('id') userId: number,
    @MessageBody() userIdInvitation: number,
  ) {
    const match = this.queues.invites.find(
      (i) => i.guest.id == userId && i.user.id == userIdInvitation,
    );
    if (!match) {
      return;
    }
    this.queues.invites = this.queues.invites.filter(
      (i) => !(i.guest.id == userId && i.user.id == userIdInvitation),
    );

    const game = await this.gameService.newGame(match.user, match.guest);

    this.allUsers[match.user.id].client.emit('gameAvailable', game.gameId);
    clientSocket.emit('gameAvailable', game.gameId);
  }

  @SubscribeMessage('declineInvitePlayerToGame')
  handleDeclineInvitePlayerToGame(
    @User('id') userId: number,
    @MessageBody() userIdInvitation: number,
  ) {
    this.queues.invites = this.queues.invites.filter(
      (i) => !(i.guest.id == userId && i.user.id == userIdInvitation),
    );

    this.sendUpdateInviteList(userId);
  }

  sendUpdateInviteList(userId: number) {
    const inviteList = this.queues.invites
      .filter((i) => i.guest.id == userId)
      .map((i) => i.user);

    this.allUsers[userId]?.client.emit('updateInviteList', inviteList);
  }

  @SubscribeMessage('findMyInvites')
  handleFindMyInvites(@User('id') userId: number) {
    this.sendUpdateInviteList(userId);
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
    const game = this.gameService.gamesInMemory[gameId];
    return game;
  }

  @SubscribeMessage('movePlayer')
  async handlePlayerMovement(
    @User('id') userId: number,
    @MessageBody()
    body: {
      up: boolean;
      down: boolean;
      gameId: number;
    },
  ) {
    this.gameService.movePlayers(userId, body);
  }

  @SubscribeMessage('getGameHistory')
  async handleGetGameHistory(@MessageBody() userId: number) {
    return await this.gameService.getAllGames(userId);
  }
}
