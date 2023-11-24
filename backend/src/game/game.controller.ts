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
  async playPingPong() {
    return await this.gameService.findAll();
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  async getGame(@Param('id', ParseIntPipe) id: number) {
    return await this.gameService.findOne(id);
  }
}
