import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SecretsManager } from './lib/aws/SecretsManager';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly secretsManager: SecretsManager,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('secrets/:secretName')
  getSecret(@Param('secretName') secretName: string): string {
    return this.secretsManager.getSecret(secretName);
  }
}
