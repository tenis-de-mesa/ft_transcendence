import { ApiHideProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  BeforeSoftRemove,
} from 'typeorm';
import {
  SessionEntity,
  FriendRequestEntity,
  MessageEntity,
  ChatMemberEntity,
  BlockListEntity,
} from '.';

export enum AuthProvider {
  INTRA = 'intra',
  GUEST = 'guest',
}

export enum UserStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  IN_GAME = 'in_game',
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

  @Column({ nullable: true })
  email: string;

  @Column({
    nullable: true,
    unique: true,
  })
  login: string;

  @Column({
    nullable: true,
    unique: true,
  })
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

  @Column({ default: 0 })
  winCount: number;

  @Column({ default: 0 })
  loseCount: number;

  @Column({ default: 0 })
  totalMatchPoints: number;

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

  @OneToMany(() => ChatMemberEntity, (member) => member.user)
  chats: ChatMemberEntity[];

  @OneToMany(() => MessageEntity, (message) => message.sender)
  messages: MessageEntity[];

  @OneToMany(() => BlockListEntity, (block) => block.blockedUser)
  blockedBy: BlockListEntity[];

  @OneToMany(() => BlockListEntity, (block) => block.blockedBy)
  blockedUsers: BlockListEntity[];

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
    this.messages = user?.messages;
    this.blockedBy = user?.blockedBy;
    this.blockedUsers = user?.blockedUsers;
    this.deletedAt = user?.deletedAt;
  }

  @BeforeSoftRemove()
  beforeSoftRemove() {
    this.login = null;
    this.nickname = null;
    this.intraId = null;
  }
}
