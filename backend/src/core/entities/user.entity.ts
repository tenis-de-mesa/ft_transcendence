import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { SessionEntity, FriendRequestEntity } from '.';

export enum AuthProvider {
  INTRA = 'intra',
  GUEST = 'guest',
}

export enum UserStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
    unique: true,
  })
  intraId: number;

  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.GUEST,
  })
  provider: AuthProvider;

  @Column({ default: false })
  tfaEnabled: boolean;

  @Column({ nullable: true })
  tfaSecret: string;

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

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];

  @ApiHideProperty()
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'friends',
    joinColumn: {
      name: 'user_id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
    },
  })
  friends: UserEntity[];

  @ApiHideProperty()
  @OneToMany(
    () => FriendRequestEntity,
    (friend_request) => friend_request.receiver,
  )
  friend_requests_received: FriendRequestEntity[];

  @ApiHideProperty()
  @OneToMany(
    () => FriendRequestEntity,
    (friend_request) => friend_request.sender,
  )
  friend_requests_sent: FriendRequestEntity[];

  constructor(user?: UserEntity) {
    this.id = user?.id;
    this.login = user?.login;
    this.nickname = user?.nickname;
    this.intraId = user?.intraId;
    this.provider = user?.provider;
  }
}
