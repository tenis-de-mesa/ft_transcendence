// https://docs.nestjs.com/modules
// https://docs.nestjs.com/techniques/database
// https://typeorm.io/#quick-start

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TfaModule } from './auth/tfa/tfa.module';
import { AppConfigModule } from './config/app-config.module';
import { TypeOrmConfigModule } from './config/typeorm-config.module';
import { FriendRequestModule } from './friend_requests/friend_request.module';
import { StatusModule } from './status/status.module';
@Module({
  imports: [
    AppConfigModule,
    TypeOrmConfigModule,
    UsersModule,
    AuthModule,
    TfaModule,
    FriendRequestModule,
    StatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
