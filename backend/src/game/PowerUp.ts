import { GameRoom } from './game.interface';

export class PowerUp {
  active: boolean;
  radius: number;
  x: number;
  y: number;

  constructor(windowWidth: number, windowHeight: number) {
    this.active = false;
    this.radius = 24;
    this.x = windowWidth / 2;
    this.y = Math.random() * ((windowHeight - this.radius) - this.radius) + this.radius;
  }

  activate(game: GameRoom) {
    if (!this.active) {
      this.active = true;
      game.ball.radius = 36;
      setTimeout(() => {
        this.deactivate(game);
      }, 10000);
    }
  }

  deactivate(game: GameRoom) {
    this.active = false;
    game.powerUpState = false;
    game.ball.radius = 16;
  }

  spawnRandom(game: GameRoom) {
    this.y =
      Math.random() * (game.windowHeight - 2 * this.radius) + this.radius;
  }
}
