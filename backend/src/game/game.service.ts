import { Injectable } from '@nestjs/common';
import { GameState, Position2D } from './interfaces';

@Injectable()
export class GameService {
  gameState: GameState = {
    ball: { x: 0, y: 0 },
    player1Score: 0,
    player2Score: 0,
  };
  player1: Position2D = { x: 0, y: 0 };
  player2: Position2D = { x: 0, y: 0 };
  constructor() {
    console.log('GameService created');
  }
  initGame() {
    this.gameState.ball.x = 0;
    this.gameState.ball.y = 0;
    this.gameState.player1Score = 0;
    this.gameState.player2Score = 0;
    this.player1.x = 0;
    this.player1.y = 0;
    this.player2.x = 0;
    this.player2.y = 0;
  }
}
