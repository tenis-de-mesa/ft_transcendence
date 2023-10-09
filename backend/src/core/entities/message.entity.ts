import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat, User } from '.';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  user: User;

  constructor(message?: Message) {
    this.id = message?.id;
    this.content = message?.content;
    this.chat = message?.chat;
  }
}
