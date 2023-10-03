import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
