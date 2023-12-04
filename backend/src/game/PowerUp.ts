import { GameRoom } from './game.interface';

export class PowerUp {
  active: boolean;
  radius: number;
  x: number;
  y: number;
  powerUp: string | undefined;

  constructor(windowWidth: number, windowHeight: number) {
    this.active = false;
    this.radius = 24;
    this.x = windowWidth / 2;
    this.y =
      Math.random() * (windowHeight - this.radius - this.radius) + this.radius;
    this.powerUp = undefined;
  }

  activate(game: GameRoom) {
    if (!this.active) {
      this.active = true;

      const getRandomValue = (seed: number): string => {
        const values = ['ballIncrease', 'ballSpeed', 'paddle'];

        const randomIndex = Math.floor(Math.random() * seed) % values.length;
        return values[randomIndex];
      };

      this.powerUp = getRandomValue(game.ball.y);
      switch (this.powerUp) {
        case 'ballIncrease':
          game.ball.radius = 36;
          break;
        case 'ballSpeed':
          game.ball.speedX *= 1.8;
          game.ball.speedY *= 1.8;
          break;
        case 'paddle':
          game.lastPlayer.paddle.height = 200;
          break;
      }

      setTimeout(() => {
        this.deactivate(game);
      }, 10000);
    }
  }

  deactivate(game: GameRoom) {
    switch (this.powerUp) {
      case 'ballIncrease':
        game.ball.radius = 16;
        break;
      case 'ballSpeed':
        game.ball.speedX /= 1.8;
        game.ball.speedY /= 1.8;
        break;
      case 'paddle':
        game.lastPlayer.paddle.height = 100;
        break;
    }
    this.powerUp = undefined;
    this.active = false;
    game.powerUpState = false;
  }

  spawnRandom(game: GameRoom) {
    this.y =
      Math.random() * (game.windowHeight - 2 * this.radius) + this.radius;
  }
}
