import { Injectable, NotFoundException } from '@nestjs/common';
import { GameRoom, Player } from './game.interface';
import { GameEntity, GameStatus } from '../core/entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../core/entities';
import { Server } from 'socket.io';

@Injectable()
export class GameService {
  gamesInMemory: Record<number, GameRoom>;

  server: Server;

  windowWidth = 700;
  windowHeight = 600;

  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    this.gamesInMemory = {};

    this.loadGames();
  }

  setServer(server: Server) {
    this.server = server;
  }

  async findOne(id: number): Promise<GameEntity> {
    const game = await this.gameRepository.findOne({
      where: {
        id,
      },
      relations: {
        playerOne: true,
        playerTwo: true,
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
        status: GameStatus.START,
      },
      relations: {
        playerOne: true,
        playerTwo: true,
      },
    });

    for (const game of games) {
      this.gamesInMemory[game.id] = this.resetDataGame(
        game.id,
        game.playerOne,
        game.playerTwo,
        game.playerOneScore,
        game.playerTwoScore,
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
    const game = await this.gameRepository.save({
      playerOne: user1,
      playerTwo: user2,
    });

    this.gamesInMemory[game.id] = this.resetDataGame(
      game.id,
      user1,
      user2,
      0,
      0,
    );

    return this.gamesInMemory[game.id];
  }

  updateGame() {
    Object.keys(this.gamesInMemory).forEach((gameId) => {
      const game = this.gamesInMemory[gameId];

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

      this.server
        ?.to(`game:${gameId}`)
        .emit('updateBallPosition', { x: game.ball.x, y: game.ball.y });
    });
  }

  gainedAPoint(gameId: number, player: 0 | 1) {
    const { players } = this.gamesInMemory[gameId];

    players[player].score++;

    if (players[player].score >= 10) {
      this.finishGame(gameId);
      this.updatePlayerStats(players);
      return;
    }

    this.gamesInMemory[gameId] = this.resetDataGame(
      gameId,
      players[0].user,
      players[1].user,
      players[0].score,
      players[1].score,
    );

    this.emitUpdatePlayerPosition(gameId);
  }

  async updatePlayerStats(players: Player[]) {
    players.forEach(async ({ user }) => {
      const winCount = await this.gameRepository.countBy({ winner: { id: user.id } })
      const loseCount = await this.gameRepository.countBy({ loser: { id: user.id } })
      this.userRepository.update(user.id, { winCount, loseCount })
    });
  }

  finishGame(gameId: number) {
    this.emitUpdatePlayerPosition(gameId);
    const game = this.gamesInMemory[gameId];
    let winner;
    let loser;
    if (game.players[0].score > game.players[1].score) {
      winner = game.players[0];
      loser = game.players[1];
    }
    else {
      winner = game.players[1];
      loser = game.players[0];
    }

    this.gameRepository.update(gameId, {
      playerOneScore: game.players[0].score,
      playerTwoScore: game.players[1].score,
      winner: winner,
      loser: loser,
      status: GameStatus.FINISH,
    });
    delete this.gamesInMemory[gameId];
  }

  movePlayers(
    userId: number,
    body: {
      up: boolean;
      down: boolean;
      gameId: number;
    },
  ) {
    const position =
      this.gamesInMemory[body.gameId].players[0].user.id == userId ? 0 : 1;

    if (body.up) {
      if (this.gamesInMemory[body.gameId].players[position].y < 10) {
        this.gamesInMemory[body.gameId].players[position].y = 0;
      } else {
        this.gamesInMemory[body.gameId].players[position].y -= 10;
      }
    }
    if (body.down) {
      if (
        this.gamesInMemory[body.gameId].players[position].y >
        this.windowHeight - 100 - 10
      ) {
        this.gamesInMemory[body.gameId].players[position].y =
          this.windowHeight - 100;
      } else {
        this.gamesInMemory[body.gameId].players[position].y += 10;
      }
    }

    this.emitUpdatePlayerPosition(body.gameId);
  }

  emitUpdatePlayerPosition(gameId: number) {
    this.server
      ?.to(`game:${gameId}`)
      .emit('updatePlayerPosition', this.gamesInMemory[gameId].players);
  }

  async getGameHistory(userId: number) {
    const history = await this.gameRepository.find({
      relations: { playerOne: true, playerTwo: true },
      where: [{ playerOne: { id: userId } }, { playerTwo: { id: userId } }],
    });
    return history;
  }
}
