import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { IntraStrategy, GuestStrategy } from './strategies';
import { SessionSerializer } from './session.serializer';
import { AppConfigModule } from '../config/app-config.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, IntraStrategy, GuestStrategy, SessionSerializer],
})
export class AuthModule {}
