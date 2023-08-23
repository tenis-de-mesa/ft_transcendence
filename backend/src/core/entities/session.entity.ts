import { ISession } from 'connect-typeorm';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Session implements ISession {
  @Index()
  @Column('bigint')
  expiredAt: number;

  @PrimaryColumn()
  id: string;

  @Column('json')
  json: string;

  @DeleteDateColumn()
  destroyedAt?: Date;
}
