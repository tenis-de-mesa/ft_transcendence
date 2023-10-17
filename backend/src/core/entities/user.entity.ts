import { ApiHideProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
import {
  SessionEntity,
  FriendRequestEntity,
  ChatEntity,
  MessageEntity,
  ChatMemberEntity,
} from '.';

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
      name: 'userId',
    },
    inverseJoinColumn: {
      name: 'friendId',
    },
  })
  friends: UserEntity[];

  @ApiHideProperty()
  @OneToMany(
    () => FriendRequestEntity,
    (friendRequest) => friendRequest.receiver,
  )
  friendRequestsReceived: FriendRequestEntity[];

  @ApiHideProperty()
  @OneToMany(() => FriendRequestEntity, (friendRequest) => friendRequest.sender)
  friendRequestsSent: FriendRequestEntity[];

  @ManyToMany(() => ChatEntity, (chat) => chat.users)
  @JoinTable({
    name: 'members',
    joinColumn: {
      name: 'userId',
    },
    inverseJoinColumn: {
      name: 'chatId',
    },
  })
  chats: ChatEntity[];

  @OneToMany(() => ChatMemberEntity, (member) => member.user)
  chatMembers: ChatMemberEntity[];

  @OneToMany(() => MessageEntity, (message) => message.sender)
  messages: MessageEntity[];

  @DeleteDateColumn()
  deletedAt?: Date;

  constructor(user?: Partial<UserEntity>) {
    this.id = user?.id;
    this.intraId = user?.intraId;
    this.login = user?.login;
    this.nickname = user?.nickname;
    this.avatarUrl = user?.avatarUrl;
    this.provider = user?.provider;
    this.tfaEnabled = user?.tfaEnabled;
    this.tfaSecret = user?.tfaSecret;
    this.tfaRecoveryCodes = user?.tfaRecoveryCodes;
    this.status = user?.status;
    this.sessions = user?.sessions;
    this.friends = user?.friends;
    this.friendRequestsReceived = user?.friendRequestsReceived;
    this.friendRequestsSent = user?.friendRequestsSent;
    this.chats = user?.chats;
    this.chatMembers = user?.chatMembers;
    this.messages = user?.messages;
    this.deletedAt = user?.deletedAt;
  }
}
