import { GameStatus, UserEntity } from '../core/entities';
import { PowerUp } from './PowerUp';

export type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Player = {
  user: UserEntity;
  score: number;
  playerType: string;
  paddle: Paddle;
};

export interface Ball {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  radius: number;
  speedFactor: number;
  verticalAdjustmentFactor: number;
}

export type Direction = {
  up: boolean;
  down: boolean;
};

export interface GameRoom {
  gameId: number;
  playerOne: Player;
  playerTwo: Player;
  ball: Ball;
  maxScore: number;
  windowWidth: number;
  windowHeight: number;
  powerUpState: boolean;
  powerUp: PowerUp;
  status: GameStatus;
}
