import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  Column,
} from 'typeorm';
import { UserEntity, MessageEntity, ChatMemberEntity } from '.';

export enum ChatAccess {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

export enum ChatType {
  CHANNEL = 'channel',
  DIRECT = 'direct',
}

@Entity({ name: 'chats' })
export class ChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.DIRECT, // TODO: Remove default value
  })
  type: ChatType;

  @Column({
    type: 'enum',
    enum: ChatAccess,
    default: ChatAccess.PRIVATE,
  })
  access: ChatAccess;

  @ManyToMany(() => UserEntity, (user) => user.chats)
  users: UserEntity[];

  @OneToMany(() => ChatMemberEntity, (member) => member.chat)
  chatMembers: ChatMemberEntity[];

  @OneToMany(() => MessageEntity, (message) => message.chat)
  messages: MessageEntity[];

  constructor(chat?: ChatEntity) {
    this.id = chat?.id;
    this.users = chat?.users;
    this.messages = chat?.messages;
  }
}
