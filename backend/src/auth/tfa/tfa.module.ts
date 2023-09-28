import { Module } from '@nestjs/common';
import { AuthModule } from '../auth.module';
import { TfaController } from './tfa.controller';
import { TfaService } from './tfa.service';
import { UsersModule } from '../../users/users.module';
import { EnvironmentConfigService } from '../../config/env.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [TfaController],
  providers: [TfaService, EnvironmentConfigService],
})
export class TfaModule {}
