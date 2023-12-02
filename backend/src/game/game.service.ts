import { Injectable, NotFoundException } from '@nestjs/common';
import { GameRoom } from './game.interface';
import { GameEntity, GameStatus } from '../core/entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity } from '../core/entities';
import { Server } from 'socket.io';
import { PowerUp } from './PowerUp';

@Injectable()
export class GameService {
  gamesInMemory: Record<number, GameRoom>;

  server: Server;

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

  async findAll(): Promise<GameEntity[]> {
    return await this.gameRepository.find({
      relations: {
        playerOne: true,
        playerTwo: true,
        winner: true,
        loser: true,
      },
    });
  }

  async findOne(id: number): Promise<GameEntity> {
    const game = await this.gameRepository.findOne({
      where: {
        id,
      },
      relations: {
        playerOne: true,
        playerTwo: true,
        winner: true,
        loser: true,
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
        status: GameStatus.START || GameStatus.PAUSE,
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
      );
      this.gamesInMemory[game.id].status = game.status;
      if (!game.isVanilla) {
        this.configurePowerUps(game.id);
      }
    }
  }

  resetDataGame(
    gameId: number,
    userOne: UserEntity,
    userTwo: UserEntity,
  ): GameRoom {
    const maxScore = this.gamesInMemory[gameId]?.maxScore ?? 10;
    const playerOneScore = this.gamesInMemory[gameId]?.playerOne.score ?? 0;
    const playerTwoScore = this.gamesInMemory[gameId]?.playerTwo.score ?? 0;
    const powerUp = this.gamesInMemory[gameId]?.powerUp;
    const status = this.gamesInMemory[gameId]?.status ?? GameStatus.START;

    const windowWidth = 700;
    const windowHeight = 600;

    return {
      gameId,
      status,
      maxScore,
      windowWidth,
      windowHeight,
      playerOne: {
        playerType: 'left',
        score: playerOneScore,
        user: userOne,
        paddle: {
          x: 10,
          y: windowHeight / 2,
          width: 10,
          height: 100,
        },
      },
      playerTwo: {
        playerType: 'right',
        score: playerTwoScore,
        user: userTwo,
        paddle: {
          x: windowWidth - 20,
          y: windowHeight / 2,
          width: 10,
          height: 100,
        },
      },
      ball: {
        x: windowWidth / 2,
        y: windowHeight / 2,
        speedX: this.getRandomElement([-3, 3]),
        speedY: this.getRandomElement([-3, 3]),
        radius: 16,
        speedFactor: 1.075,
        verticalAdjustmentFactor: 8,
      },
      powerUpState: false,
      powerUp,
      lastPlayer: undefined,
    };
  }

  configurePowerUps(gameId: number) {
    this.gamesInMemory[gameId].powerUp = new PowerUp(
      this.gamesInMemory[gameId].windowWidth,
      this.gamesInMemory[gameId].windowHeight,
    );
  }

  getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRunningGame(userId: number): GameRoom {
    const exists = Object.keys(this.gamesInMemory).find((gameId) => {
      const { playerOne, playerTwo }: GameRoom = this.gamesInMemory[gameId];
      return playerOne.user.id == userId || playerTwo.user.id == userId;
    });

    if (exists) {
      return this.gamesInMemory[exists];
    }

    return null;
  }

  async newGame(user1: UserEntity, user2: UserEntity, isVanilla = false) {
    if (this.getRunningGame(user1.id) ?? this.getRunningGame(user2.id)) {
      return null;
    }

    const game = await this.gameRepository.save({
      isVanilla,
      playerOne: user1,
      playerTwo: user2,
    });

    this.gamesInMemory[game.id] = this.resetDataGame(game.id, user1, user2);

    if (!isVanilla) {
      this.configurePowerUps(game.id);
    }

    return this.gamesInMemory[game.id];
  }

  checkUserDisconnect(user: UserEntity) {
    const sockets = this.server.sockets.adapter.rooms.get(`user:${user.id}`);

    if (!sockets) {
      return true;
    }

    return sockets.size == 0;
  }

  async pauseGame(gameId: number) {
    this.gamesInMemory[gameId].status = GameStatus.PAUSE;

    const playerOneUser = this.gamesInMemory[gameId].playerOne.user;
    const playerTwoUser = this.gamesInMemory[gameId].playerTwo.user;

    await this.gameRepository.update(gameId, { status: GameStatus.PAUSE });

    const maxTime = 1000 * 15;
    const intervalTime = 1000;
    let currentTime = 0;

    this.server
      .to(`game:${gameId}`)
      .emit('gamePause', (maxTime - currentTime) / 1000);

    const interval = setInterval(() => {
      if (this.gamesInMemory[gameId].status != GameStatus.PAUSE) {
        clearInterval(interval);
        return;
      }

      currentTime += intervalTime;

      if (currentTime >= maxTime) {
        clearInterval(interval);

        const checkPlayerOne = this.checkUserDisconnect(playerOneUser);
        const checkPlayerTwo = this.checkUserDisconnect(playerTwoUser);

        if (checkPlayerOne && checkPlayerTwo) {
          this.abandonedGame(gameId);
        } else if (checkPlayerOne) {
          this.walkoverGame(gameId, playerTwoUser);
        } else if (checkPlayerTwo) {
          this.walkoverGame(gameId, playerOneUser);
        } else {
          this.unpauseGame(gameId);
        }
      } else {
        this.server
          .to(`game:${gameId}`)
          .emit('gamePause', (maxTime - currentTime) / 1000);
      }
    }, intervalTime);
  }

  async unpauseGame(gameId: number) {
    this.gamesInMemory[gameId].status = GameStatus.START;
    await this.gameRepository.update(gameId, { status: GameStatus.START });
  }

  async emitCurrentGames() {
    const currentLiveGames = Object.values(this.gamesInMemory).map((game) => {
      return {
        gameId: game.gameId,
        playerOneNickname: game.playerOne.user.nickname,
        playerTwoNickname: game.playerTwo.user.nickname,
      };
    });
    this.server.emit('currentLiveGames', currentLiveGames);
  }

  async updateGame() {
    Object.values(this.gamesInMemory).forEach((game) => {
      if (game.status == GameStatus.PAUSE) {
        return;
      }

      if (
        this.checkUserDisconnect(game.playerOne.user) ||
        this.checkUserDisconnect(game.playerTwo.user)
      ) {
        this.pauseGame(game.gameId);
        return;
      }

      game.ball.x += game.ball.speedX;
      game.ball.y += game.ball.speedY;

      if (
        game.ball.y < 0 + game.ball.radius ||
        game.ball.y > game.windowHeight - game.ball.radius
      ) {
        game.ball.speedY = -game.ball.speedY;
      }

      if (game.ball.x <= 0) {
        game.playerTwo.score++;
        return this.gainedAPoint(game.gameId);
      } else if (game.ball.x >= game.windowWidth) {
        game.playerOne.score++;
        return this.gainedAPoint(game.gameId);
      }

      for (const player of [game.playerOne, game.playerTwo]) {
        if (!player) {
          continue;
        }
        const paddle = player.paddle;

        const ballInXRange =
          game.ball.x + game.ball.radius > paddle.x &&
          game.ball.x - game.ball.radius < paddle.x + paddle.width;

        const ballInYRange =
          game.ball.y + game.ball.radius > paddle.y &&
          game.ball.y - game.ball.radius < paddle.y + paddle.height;

        if (ballInXRange && ballInYRange) {
          game.ball.speedX = -game.ball.speedX;
          game.ball.speedX *= game.ball.speedFactor;

          const relativeCollision =
            (game.ball.y - paddle.y) / paddle.height - 0.5;
          game.ball.speedY =
            relativeCollision * game.ball.verticalAdjustmentFactor;
          game.ball.speedY *= game.ball.speedFactor;

          game.lastPlayer = player;
        }
      }

      this.server?.to(`game:${game.gameId}`).emit('updateBallPosition', {
        x: game.ball.x,
        y: game.ball.y,
        radius: game.ball.radius,
      });

      if (game.powerUp) {
        let shouldSpawnPowerUp: boolean;
        if (!game.powerUpState && !game.powerUp.active) {
          shouldSpawnPowerUp = Math.random() < 0.005;
          game.powerUpState = true;
        }

        if (shouldSpawnPowerUp && !game.powerUp.active) {
          game.powerUp.spawnRandom(game);
        }

        const powerUpHit =
          Math.sqrt(
            Math.pow(game.ball.x - game.powerUp.x, 2) +
              Math.pow(game.ball.y - game.powerUp.y, 2),
          ) <
          game.ball.radius + game.powerUp.radius;
        if (powerUpHit) {
          game.powerUp.activate(game);
          this.server?.to(`game:${game.gameId}`).emit('pup');
        }

        this.server?.to(`game:${game.gameId}`).emit('updatePowerUp', {
          x: game.powerUp.x,
          y: game.powerUp.y,
          active: game.powerUp.active,
          powerUp: game.powerUp,
        });
      }
    });
  }

  async gainedAPoint(gameId: number) {
    const { playerOne, playerTwo, maxScore } = this.gamesInMemory[gameId];

    if (playerOne.score >= maxScore || playerTwo.score >= maxScore) {
      await this.finishGame(gameId);
      this.emitGameOver(gameId);
      this.updatePlayerStats(playerOne.user.id);
      this.updatePlayerStats(playerTwo.user.id);
      return;
    }

    this.gamesInMemory[gameId] = this.resetDataGame(
      gameId,
      playerOne.user,
      playerTwo.user,
    );

    this.emitUpdatePlayerPosition(gameId);
  }

  async updatePlayerStats(userId: number) {
    const winCount = await this.gameRepository.countBy({
      winner: { id: userId },
    });
    const loseCount = await this.gameRepository.countBy({
      loser: { id: userId },
    });
    const totalMatchPointsAsOne = await this.gameRepository.sum(
      'playerOneMatchPoints',
      { playerOne: { id: userId } },
    );
    const totalMatchPointsAsTwo = await this.gameRepository.sum(
      'playerTwoMatchPoints',
      { playerTwo: { id: userId } },
    );
    const totalMatchPoints = totalMatchPointsAsOne + totalMatchPointsAsTwo;
    await this.userRepository.update(
      { id: userId },
      { winCount, loseCount, totalMatchPoints },
    );
  }

  async finishGame(gameId: number) {
    this.emitUpdatePlayerPosition(gameId);

    let winner: UserEntity;
    let loser: UserEntity;
    let playerOneMatchPoints: number;
    let playerTwoMatchPoints: number;

    const game = this.gamesInMemory[gameId];
    delete this.gamesInMemory[gameId];

    const status = GameStatus.FINISH;
    const playerOneScore = game.playerOne.score;
    const playerTwoScore = game.playerTwo.score;

    if (playerOneScore > playerTwoScore) {
      winner = game.playerOne.user;
      loser = game.playerTwo.user;
      playerOneMatchPoints = playerOneScore * 10 + 30;
      playerTwoMatchPoints = playerTwoScore * 10 - 20;
    } else {
      winner = game.playerTwo.user;
      loser = game.playerOne.user;
      playerTwoMatchPoints = playerTwoScore * 10 + 30;
      playerOneMatchPoints = playerOneScore * 10 - 20;
    }

    await this.gameRepository.update(gameId, {
      status,
      winner,
      loser,
      playerOneScore,
      playerTwoScore,
      playerOneMatchPoints,
      playerTwoMatchPoints,
    });
  }

  async abandonedGame(gameId: number) {
    await this.gameRepository.update(gameId, {
      status: GameStatus.FINISH,
    });

    await this.emitGameOver(gameId);
  }

  async walkoverGame(gameId: number, winner: UserEntity) {
    const game = this.gamesInMemory[gameId];

    if (!game) {
      return;
    }

    delete this.gamesInMemory[gameId];

    const status = GameStatus.FINISH;
    const playerOneMatchPoints = 0;
    const playerTwoMatchPoints = 0;
    const playerOneScore = game.playerOne.score;
    const playerTwoScore = game.playerTwo.score;

    const loser =
      game.playerOne.user.id == winner.id
        ? game.playerTwo.user
        : game.playerOne.user;

    await this.gameRepository.update(gameId, {
      status,
      winner,
      loser,
      playerOneScore,
      playerTwoScore,
      playerOneMatchPoints,
      playerTwoMatchPoints,
    });

    await this.emitGameOver(gameId);
  }

  async emitGameOver(gameId: number) {
    const game = await this.findOne(gameId);

    this.server?.to(`game:${gameId}`).emit('gameOver', game);
  }

  movePlayers(
    userId: number,
    body: {
      up: boolean;
      down: boolean;
      gameId: number;
    },
  ) {
    if (!this.gamesInMemory[body.gameId]) {
      return;
    }

    if (this.gamesInMemory[body.gameId].status == GameStatus.PAUSE) {
      return;
    }

    const { windowHeight, powerUp } = this.gamesInMemory[body.gameId];

    const position =
      this.gamesInMemory[body.gameId].playerOne.user.id == userId ? 0 : 1;

    const player =
      position == 0
        ? this.gamesInMemory[body.gameId].playerOne
        : this.gamesInMemory[body.gameId].playerTwo;

    const movementfactor = 20;

    if (body.up) {
      if (player.paddle.y < 10) {
        player.paddle.y = 0;
      } else {
        player.paddle.y -= movementfactor;
      }
    }
    if (body.down) {
      let deltaPaddleSize = 100;
      if (powerUp.powerUp == 'paddle') {
        deltaPaddleSize = 200;
      }

      if (player.paddle.y > windowHeight - deltaPaddleSize - 10) {
        player.paddle.y = windowHeight - deltaPaddleSize;
      } else {
        player.paddle.y += movementfactor;
      }
    }

    if (position == 0) {
      this.gamesInMemory[body.gameId].playerOne = player;
    } else {
      this.gamesInMemory[body.gameId].playerTwo = player;
    }

    this.emitUpdatePlayerPosition(body.gameId);
  }

  emitUpdatePlayerPosition(gameId: number) {
    this.server
      ?.to(`game:${gameId}`)
      .emit('updatePlayerPosition', [
        this.gamesInMemory[gameId].playerOne,
        this.gamesInMemory[gameId].playerTwo,
      ]);
  }

  async getAllGames(userId: number) {
    const games = await this.gameRepository.find({
      relations: { playerOne: true, playerTwo: true },
      where: [{ playerOne: { id: userId } }, { playerTwo: { id: userId } }],
    });
    return games;
  }

  async seedGames(user: UserEntity, gamesCount: number): Promise<void> {
    const loser = await this.userRepository.findOne({
      where: { id: Not(user.id) },
    });
    for (let i = 0; i < gamesCount; i++) {
      const game = new GameEntity();
      game.status = GameStatus.FINISH;
      game.playerOne = user;
      game.playerTwo = loser;
      game.playerOneScore = Math.floor(Math.random() * 10);
      game.playerTwoScore = Math.floor(Math.random() * 10);
      game.winner = user;
      game.loser = loser;
      await this.gameRepository.save(game);
    }
  }
}
