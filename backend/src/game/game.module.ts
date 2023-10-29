import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { SessionsService } from '../users/sessions/sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from '../core/entities';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  controllers: [GameController],
  providers: [GameService, GameGateway, SessionsService],
})
export class GameModule {}
