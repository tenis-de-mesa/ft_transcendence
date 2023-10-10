import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  Column,
} from 'typeorm';
import { UserEntity, MessageEntity } from '.';

enum ChatType {
  PRIVATE = 'private',
  CHANNEL = 'channel',
}

@Entity({ name: 'chats' })
export class ChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.PRIVATE,
  })
  type: ChatType;

  @ManyToMany(() => UserEntity, (user) => user.chats)
  users: UserEntity[];

  @OneToMany(() => MessageEntity, (message) => message.chat)
  messages: MessageEntity[];

  constructor(chat?: ChatEntity) {
    this.id = chat?.id;
    this.users = chat?.users;
    this.messages = chat?.messages;
  }
}
