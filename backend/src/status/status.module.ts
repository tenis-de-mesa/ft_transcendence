import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusGateway } from './status.gateway';

@Module({
  providers: [StatusGateway, StatusService]
})
export class StatusModule {}
