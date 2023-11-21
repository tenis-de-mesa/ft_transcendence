import { Injectable } from '@nestjs/common';
import { GameRoom } from './game.interface';

@Injectable()
export class GameService {
  game: GameRoom;

  windowWidth = 700;
  windowHeight = 600;

  constructor() {

  }

  initGame({ id, player1, player2 }) {
    this.game = {
      id,
      players: [player1, player2],
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

  gameLoop() {
    this.game.ball.x += this.game.ball.speedX;
    this.game.ball.y += this.game.ball.speedY;

    if (this.game.ball.x <= 0 || this.game.ball.x >= this.windowWidth) {
      this.game.ball.speedX = -this.game.ball.speedX;
    }

    if (this.game.ball.y <= 0 || this.game.ball.y >= this.windowHeight) {
      this.game.ball.speedY = -this.game.ball.speedY;
    }

    for (const player of this.game.players) {
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
          this.game.ball.x + this.game.ball.radius > playerX &&
          this.game.ball.x - this.game.ball.radius < playerX + playerWidth;

        const ballInYRange =
          this.game.ball.y + this.game.ball.radius > playerY &&
          this.game.ball.y - this.game.ball.radius < playerY + playerHeight;

        if (ballInXRange && ballInYRange) {
          this.game.ball.speedX = -this.game.ball.speedX;
        }
      }
    }
  }
}
