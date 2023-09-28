import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users.service';

@Injectable()
export class GuestCleanupService {
  constructor(private readonly usersService: UsersService) {}

  async cleanupGuestUsers(): Promise<void> {
    const guestUsers = await this.usersService.findObsoleteGuestUsers();

    for (const user of guestUsers) {
      await this.usersService.deleteUser(user.id);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupTask(): Promise<void> {
    await this.cleanupGuestUsers();
  }
}
