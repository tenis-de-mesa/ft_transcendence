import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Session, FriendRequest } from '.';
import { Chat } from './chat.entity';

export enum AuthProvider {
  INTRA = 'intra',
  GUEST = 'guest',
}

export enum UserStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

@Entity({ name: 'users' })
export class User {
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

  @OneToMany(() => Session, (session) => session.user)
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


  @ManyToMany(() => Chat, (chat) => chat.users)
  @JoinTable()
  chats: Chat[];

  constructor(user?: User) {
    this.id = user?.id;
    this.login = user?.login;
    this.nickname = user?.nickname;
    this.intraId = user?.intraId;
    this.provider = user?.provider;
  }
}
