import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../src/core/entities';

export default TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [UserEntity],
  dropSchema: true,
  synchronize: true,
  logging: false,
});
