import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { UserEntity, ChatEntity } from '.';

export enum ChatMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum ChatMemberStatus {
  ACTIVE = 'active',
  MUTED = 'muted',
  BANNED = 'banned',
}

@Entity({ name: 'members' })
export class ChatMemberEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  chatId: number;

  @Column({
    type: 'enum',
    enum: ChatMemberRole,
    default: ChatMemberRole.MEMBER,
  })
  role: ChatMemberRole;

  @Column({
    type: 'enum',
    enum: ChatMemberStatus,
    default: ChatMemberStatus.ACTIVE,
  })
  status: ChatMemberStatus;

  @ManyToOne(() => UserEntity, (user) => user.chats)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserEntity;

  @ManyToOne(() => ChatEntity, (chat) => chat.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatId', referencedColumnName: 'id' })
  chat: ChatEntity;

  constructor(member?: Partial<ChatMemberEntity>) {
    this.user = member?.user;
    this.userId = member?.userId;
    this.chat = member?.chat;
    this.chatId = member?.chatId;
    this.role = member?.role;
    this.status = member?.status;
  }
}
