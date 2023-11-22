import { Injectable, NotFoundException } from '@nestjs/common';
import { GameRoom, Player } from './game.interface';
import { GameEntity, GameStatus } from '../core/entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../core/entities';
import { Server } from 'socket.io';

@Injectable()
export class GameService {
  games: Record<number, GameRoom>;

  windowWidth = 700;
  windowHeight = 600;

  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
  ) {
    this.games = {};

    this.loadGames();
  }

  async findOne(id: number): Promise<GameEntity> {
    const game = await this.gameRepository.findOne({
      where: {
        id,
      },
      relations: {
        users: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async loadGames() {
    const games = await this.gameRepository.find({
      where: {
        status: GameStatus.START || GameStatus.STOP,
      },
      relations: {
        users: true,
      },
    });

    console.log('loadGames', games.length);

    for (const game of games) {
      this.games[game.id] = this.resetDataGame(
        game.id,
        game.users[0],
        game.users[1],
        game.score1,
        game.score2,
      );
    }
  }

  resetDataGame(
    gameId: number,
    user1: UserEntity,
    user2: UserEntity,
    score1: number,
    score2: number,
  ): GameRoom {
    return {
      gameId,
      players: [
        {
          playerType: 'left',
          y: this.windowHeight / 2,
          score: score1,
          user: user1,
        },
        {
          playerType: 'rigth',
          y: this.windowHeight / 2,
          score: score2,
          user: user2,
        },
      ],
      ball: {
        x: this.windowWidth / 2,
        y: this.windowHeight / 2,
        speedX: 2,
        speedY: 2,
        radius: 16,
      },
    };
  }

  async newGame(user1: UserEntity, user2: UserEntity) {
    const game = await this.gameRepository.save({ users: [user1, user2] });

    console.log('newGame', game.id);

    this.games[game.id] = this.resetDataGame(game.id, user1, user2, 0, 0);

    return this.games[game.id];
  }

  updateGame(server: Server) {
    Object.keys(this.games).forEach((gameId) => {
      const game = this.games[gameId];

      game.ball.x += game.ball.speedX;
      game.ball.y += game.ball.speedY;

      // if (game.ball.x <= 0 || game.ball.x >= this.windowWidth) {
      //   game.ball.speedX = -game.ball.speedX;
      // }

      if (game.ball.y <= 0 || game.ball.y >= this.windowHeight) {
        game.ball.speedY = -game.ball.speedY;
      }

      if (game.ball.x <= 0) {
        return this.gainedAPoint(game.gameId, 0);
      } else if (game.ball.x >= this.windowWidth) {
        return this.gainedAPoint(game.gameId, 1);
      }

      for (const player of game.players) {
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
            game.ball.x + game.ball.radius > playerX &&
            game.ball.x - game.ball.radius < playerX + playerWidth;

          const ballInYRange =
            game.ball.y + game.ball.radius > playerY &&
            game.ball.y - game.ball.radius < playerY + playerHeight;

          if (ballInXRange && ballInYRange) {
            game.ball.speedX = -game.ball.speedX;
          }
        }
      }

      server
        .to(`game:${gameId}`)
        .emit('updateBallPosition', { x: game.ball.x, y: game.ball.y });
    });
  }

  gainedAPoint(gameId: number, player: 0 | 1) {
    const { players } = this.games[gameId];

    players[player].score++;

    if (players[player].score >= 10) {
      return this.finishGame(gameId);
    }

    this.games[gameId] = this.resetDataGame(
      gameId,
      players[0].user,
      players[1].user,
      players[0].score,
      players[1].score,
    );
  }

  finishGame(gameId: number) {
    const game = this.games[gameId];
    this.gameRepository.update(gameId, {
      score1: game.players[0].score,
      score2: game.players[1].score,
      status: GameStatus.FINISH,
    });
    delete this.games[gameId];
  }

  movePlayers(
    server: Server,
    userId: number,
    body: {
      up: boolean;
      down: boolean;
      gameId: number;
    },
  ) {
    const position =
      this.games[body.gameId].players[0].user.id == userId ? 0 : 1;

    if (body.up) {
      if (this.games[body.gameId].players[position].y < 10) {
        this.games[body.gameId].players[position].y = 0;
      } else {
        this.games[body.gameId].players[position].y -= 10;
      }
    }
    if (body.down) {
      if (
        this.games[body.gameId].players[position].y >
        this.windowHeight - 100 - 10
      ) {
        this.games[body.gameId].players[position].y = this.windowHeight - 100;
      } else {
        this.games[body.gameId].players[position].y += 10;
      }
    }

    server
      .to(`game:${body.gameId}`)
      .emit('updatePlayerPosition', this.games[body.gameId].players);
  }
}
