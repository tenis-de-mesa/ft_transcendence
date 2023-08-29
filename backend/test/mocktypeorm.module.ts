import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/core/entities';

export default TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [User],
  dropSchema: true,
  synchronize: true,
  logging: false,
});
