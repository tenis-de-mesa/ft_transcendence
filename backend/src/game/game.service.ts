import { Injectable } from '@nestjs/common';
import { GameState } from './interfaces/gameState.interface';

@Injectable()
export class GameService {
  gameState: GameState = {
    ballX: 0,
    ballY: 0,
    player1Score: 0,
    player2Score: 0,
  };
  constructor() {
    console.log('GameService created');
  }
}
