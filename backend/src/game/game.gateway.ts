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
    matchVanilla: UserEntity[];
    matchPowerUp: UserEntity[];
    invites: {
      user: UserEntity;
      guest: UserEntity;
    }[];
  };

  interval: NodeJS.Timeout;

  constructor(
    private readonly sessionService: SessionsService,
    private readonly userService: UsersService,
    private readonly gameService: GameService,
  ) {
    this.interval = setInterval(() => {
      this.matchMakingPowerUps();
      this.matchMakingVanilla();
      this.gameService.updateGame();
    }, 16);
    this.queues = {
      matchVanilla: [],
      matchPowerUp: [],
      invites: [],
    };
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
    const user: UserEntity = clientSocket.handshake.auth?.user;

    if (user) {
      clientSocket.join(`user:${user.id}`);
    }

    const game = this.gameService.getRunningGame(user.id);

    if (game) {
      clientSocket.emit('gameAvailable', game.gameId);
    }
  }

  handleDisconnect(clientSocket: Socket) {
    const user: UserEntity = clientSocket.handshake.auth?.user;

    if (user) {
      this.queues.matchVanilla = this.queues.matchVanilla.filter(
        (u) => u.id != user.id,
      );
      this.queues.matchPowerUp = this.queues.matchPowerUp.filter(
        (u) => u.id != user.id,
      );
      this.queues.invites = this.queues.invites.filter((u) => {
        if (u.user.id == user.id) {
          this.sendUpdateInviteList(u.guest.id);
        } else if (u.guest.id == user.id) {
          this.sendUpdateInviteList(u.user.id);
        }
        return u.user.id != user.id && u.guest.id != user.id;
      });
    }
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

  async matchMakingPowerUps() {
    if (this.queues.matchPowerUp.length < 2) {
      return;
    }

    const [playerOne, playerTwo] = this.queues.matchPowerUp.splice(0, 2);

    const game = await this.gameService.newGame(playerOne, playerTwo);

    if (!game) {
      return;
    }

    this.server.to(`user:${playerOne.id}`).emit('gameAvailable', game.gameId);
    this.server.to(`user:${playerTwo.id}`).emit('gameAvailable', game.gameId);
  }

  async matchMakingVanilla() {
    if (this.queues.matchVanilla.length < 2) {
      return;
    }

    const [playerOne, playerTwo] = this.queues.matchVanilla.splice(0, 2);

    const game = await this.gameService.newGame(playerOne, playerTwo, true);

    if (!game) {
      return;
    }

    this.server.to(`user:${playerOne.id}`).emit('gameAvailable', game.gameId);
    this.server.to(`user:${playerTwo.id}`).emit('gameAvailable', game.gameId);
  }

  @SubscribeMessage('findGame')
  handleFindGame(
    @User() user: UserEntity,
    @MessageBody()
    body: {
      vanilla: boolean;
    },
  ) {
    if (body?.vanilla) {
      if (this.queues.matchVanilla.find((u) => u.id == user.id)) {
        return;
      }

      this.queues.matchVanilla.push(user);
    } else {
      if (this.queues.matchPowerUp.find((u) => u.id == user.id)) {
        return;
      }

      this.queues.matchPowerUp.push(user);
    }
  }

  @SubscribeMessage('cancelFindGame')
  handleCancelFindGame(
    @User() user: UserEntity,
    @MessageBody()
    body: {
      vanilla: boolean;
    },
  ) {
    if (body?.vanilla) {
      this.queues.matchVanilla = this.queues.matchVanilla.filter(
        (u) => u.id != user.id,
      );
    } else {
      this.queues.matchPowerUp = this.queues.matchPowerUp.filter(
        (u) => u.id != user.id,
      );
    }
  }

  @SubscribeMessage('inFindGame')
  handleFindGameQueue(
    @User() user: UserEntity,
    @MessageBody()
    body: {
      vanilla: boolean;
    },
  ): boolean {
    if (body?.vanilla) {
      return Boolean(this.queues.matchPowerUp.find((u) => u.id == user.id));
    } else {
      return Boolean(this.queues.matchVanilla.find((u) => u.id == user.id));
    }
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

    this.queues.invites.push({ guest, user });

    this.sendUpdateInviteList(guest.id);

    if (!this.gameService.getRunningGame(guest.id)) {
      this.server.to(`user:${guest.id}`).emit('newGameInvite', user);
    }
  }

  @SubscribeMessage('acceptInvitePlayerToGame')
  async handleAcceptInvitePlayerToGame(
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

    if (!game) {
      return;
    }

    this.server.to(`user:${match.user.id}`).emit('gameAvailable', game.gameId);
    this.server.to(`user:${userId}`).emit('gameAvailable', game.gameId);
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

    this.server.to(`user:${userId}`).emit('updateInviteList', inviteList);
  }

  @SubscribeMessage('findMyInvites')
  handleFindMyInvites(@User('id') userId: number) {
    this.sendUpdateInviteList(userId);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: number,
  ) {
    client.join(`game:${gameId}`);
    return this.gameService.gamesInMemory[gameId];
  }

  @SubscribeMessage('leaveGame')
  async handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @User('id') userId: number,
    @MessageBody() gameId: number,
  ) {
    const game = this.gameService.getRunningGame(userId);
    if (game) {
      client.emit('gameAvailable', game.gameId);
    } else {
      client.leave(`game:${gameId}`);
    }
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
