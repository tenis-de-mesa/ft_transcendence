import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { FriendRequest } from './friend_request.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Session } from '.';

export enum UserStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ default: false })
  tfaEnabled: boolean;

  @Column({ nullable: true })
  tfaSecret: string;

  @Column({ nullable: true })
  avatarPath: string;

  @Column('varchar', {
    array: true,
    nullable: true,
  })
  tfaRecoveryCodes: string[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;

  @OneToMany(() => Session, (session) => session.user, {
    eager: true,
  })
  sessions: Session[];

  @ApiHideProperty()
  @ManyToMany(() => User)
  @JoinTable({
    name: 'friends',
    joinColumn: {
      name: 'user_id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
    },
  })
  friends: User[];

  @ApiHideProperty()
  @OneToMany(() => FriendRequest, (friend_request) => friend_request.receiver)
  friend_requests_received: FriendRequest[];

  @ApiHideProperty()
  @OneToMany(() => FriendRequest, (friend_request) => friend_request.sender)
  friend_requests_sent: FriendRequest[];
}
