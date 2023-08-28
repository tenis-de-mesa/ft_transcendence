import { ISession } from 'connect-typeorm';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '.';

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

  @Column({nullable: true})
  user_id: number;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({name: 'user_id'})
  user: User;
}
