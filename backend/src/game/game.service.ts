import { Injectable } from '@nestjs/common';
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
    this.games = {}

    this.loadGames()
  }

  async loadGames() {
    const games = await this.gameRepository.find({
      where: {
        status: GameStatus.START
      },
      relations: {
        users: true
      }
    })

    console.log('loadGames', games.length)

    for (const game of games) {
      this.games[game.id] = {
        gameId: game.id,
        players: [{
          playerType: 'left',
          y: 0,
          user: game.users[0]
        }, {
          playerType: 'rigth',
          y: 0,
          user: game.users[1]
        }],
        ball: {
          x: this.windowWidth / 2,
          y: this.windowHeight / 2,
          speedX: 4,
          speedY: 4,
          radius: 16,
        },
        score: {
          playerOne: 0,
          playerTwo: 0,
        }
        ,
        direction: { down: false, up: false }
      }
    }
  }

  async newGame(user1: UserEntity, user2: UserEntity) {
    const game = await this.gameRepository.save({ users: [user1, user2] })

    console.log('newGame', game.id)

    this.games[game.id] = {
      gameId: game.id,
      players: [{
        playerType: 'left',
        y: 0,
        user: user1
      }, {
        playerType: 'rigth',
        y: 0,
        user: user2
      }],
      ball: {
        x: this.windowWidth / 2,
        y: this.windowHeight / 2,
        speedX: 4,
        speedY: 4,
        radius: 16,
      },
      score: {
        playerOne: 0,
        playerTwo: 0,
      }
      ,
      direction: { down: false, up: false }
    }

    return game.id
  }

  updateGame(server: Server) {
    Object.keys(this.games).forEach((gameId) => {
      const game = this.games[gameId]

      // console.log('updateGame', game)

      game.ball.x += game.ball.speedX;
      game.ball.y += game.ball.speedY;

      if (game.ball.x <= 0 || game.ball.x >= this.windowWidth) {
        game.ball.speedX = -game.ball.speedX;
      }

      if (game.ball.y <= 0 || game.ball.y >= this.windowHeight) {
        game.ball.speedY = -game.ball.speedY;
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

      server.to(`game:${game.id}`).emit('updateBallPosition', { x: game.ball.x, y: game.ball.y });
    })


  }
}
