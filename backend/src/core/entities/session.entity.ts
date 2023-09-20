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
import { UserEntity } from '.';

@Entity({ name: 'sessions' })
export class SessionEntity implements ISession {
  @Index()
  @Column('bigint')
  expiredAt: number;

  @PrimaryColumn()
  id: string;

  @Column('json')
  json: string;

  @DeleteDateColumn()
  destroyedAt?: Date;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  socketId: string;
}
