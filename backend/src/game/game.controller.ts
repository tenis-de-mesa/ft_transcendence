import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { AuthenticatedGuard } from '../auth/guards';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @Get('/')
  playPingPong(): string {
    return 'Ping Pong!';
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  async getGame(@Param('id', ParseIntPipe) id: number) {
    return await this.gameService.findOne(id);
  }
}
