import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  Column,
} from 'typeorm';
import { User, Message } from '.';

enum ChatType {
  PRIVATE = 'private',
  CHANNEL = 'channel',
}

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.PRIVATE,
  })
  type: ChatType;

  @ManyToMany(() => User, (user) => user.chats)
  users: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  constructor(chat?: Chat) {
    this.id = chat?.id;
    this.users = chat?.users;
    this.messages = chat?.messages;
  }
}
