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

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  socketId: string;

  constructor(session?: Session) {
    this.id = session?.id;
    this.expiredAt = session?.expiredAt;
    this.json = session?.json;
    this.destroyedAt = session?.destroyedAt;
    this.userId = session?.userId;
    this.user = session?.user;
    this.socketId = session?.socketId;
  }
}
