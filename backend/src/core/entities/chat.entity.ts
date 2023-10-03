import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.chats)
  users: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
