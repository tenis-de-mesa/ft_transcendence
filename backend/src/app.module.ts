// https://docs.nestjs.com/modules
// https://docs.nestjs.com/techniques/database
// https://typeorm.io/#quick-start

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/app-config.module';
import { TypeOrmConfigModule } from './config/typeorm-config.module';

@Module({
  imports: [AppConfigModule, TypeOrmConfigModule, UsersModule, AuthModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
