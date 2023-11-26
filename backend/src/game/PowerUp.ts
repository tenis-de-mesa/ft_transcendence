import { GameRoom } from "./game.interface";

export class PowerUp {
  x: number;
  y: number;
  radius: number;
  active: boolean;

  constructor(windowWidth: number) {
    this.x = windowWidth / 2;
    this.y = 0;
    this.radius = 24;
    this.active = false;
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
    game.ball.radius = 16;
  }

  spawnRandom(game: GameRoom) {
    this.y = Math.random() * (game.windowHeight - 2 * this.radius) + this.radius;
  }
}
