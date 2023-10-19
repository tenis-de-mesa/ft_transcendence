import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users.service';
import { StatusGateway } from '../status/status.gateway';
import { UserStatus } from '../../core/entities';

@Injectable()
export class GuestCleanupService {
  constructor(
    private readonly usersService: UsersService,
    private readonly statusGateway: StatusGateway,
  ) {}

  async cleanupGuestUsers(): Promise<void> {
    const guestUsers = await this.usersService.findObsoleteGuestUsers();

    for (const user of guestUsers) {
      await this.usersService.deleteUser(user.id);
      this.statusGateway.emitUserStatus(user.id, UserStatus.OFFLINE);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupTask(): Promise<void> {
    await this.cleanupGuestUsers();
  }
}
