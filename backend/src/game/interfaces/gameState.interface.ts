import { Position2D } from './position.interface';

export interface GameState {
  player1Score: number;
  player2Score: number;
  ball: Position2D;
}
