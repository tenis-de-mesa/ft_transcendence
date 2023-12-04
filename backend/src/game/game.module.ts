import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { SessionsService } from '../users/sessions/sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity, UserEntity } from '../core/entities';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { BlockListEntity } from '../core/entities/blockList.entity';
import { GameEntity } from '../core/entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionEntity,
      UserEntity,
      BlockListEntity,
      GameEntity,
    ]),
    UsersModule,
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway, UsersService, SessionsService],
})
export class GameModule {}
