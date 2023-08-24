import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestSeeds1692877522582 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const testUsers = [
      { id: 123, login: 'johndoe' },
      { id: 124, login: 'janedoe' },
      { id: 125, login: 'bobsmith' },
    ];

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('users')
      .values(testUsers)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('users')
      .where('login IN (:...logins)', {
        logins: ['johndoe', 'janedoe', 'bobsmith'],
      })
      .execute();
  }
}
