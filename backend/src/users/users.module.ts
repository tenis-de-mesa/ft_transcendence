import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, Session } from '../core/entities';
import { EnvironmentConfigService } from '../config/env.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [UsersController],
  providers: [UsersService, EnvironmentConfigService],
  exports: [UsersService],
})
export class UsersModule {}
