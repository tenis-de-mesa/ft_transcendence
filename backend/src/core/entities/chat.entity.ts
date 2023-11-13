import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { MessageEntity, ChatMemberEntity, UserEntity } from '.';

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

  @Column({ nullable: true })
  password: string;

  @ManyToOne(() => UserEntity, (user) => user.createdChats)
  createdBy: UserEntity;

  @OneToMany(() => ChatMemberEntity, (member) => member.chat)
  users: ChatMemberEntity[];

  @OneToMany(() => MessageEntity, (message) => message.chat, { cascade: true })
  messages: MessageEntity[];

  constructor(chat?: Partial<ChatEntity>) {
    this.id = chat?.id;
    this.type = chat?.type;
    this.access = chat?.access;
    this.password = chat?.password;
    this.users = chat?.users;
    this.messages = chat?.messages;
    this.createdBy = chat?.createdBy;
  }
}
