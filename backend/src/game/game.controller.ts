import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { AuthenticatedGuard } from '../auth/guards';
import { User } from '../core/decorators';
import { UserEntity } from '../core/entities';

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

  @UseGuards(AuthenticatedGuard)
  @Post('seed')
  async seedUsers(@User() user: UserEntity) {
    return await this.gameService.seedGames(user, 25);
  }
}
