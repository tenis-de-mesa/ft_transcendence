import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatEntity, UserEntity } from '.';

@Entity({ name: 'messages' })
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages)
  chat: ChatEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  sender: UserEntity;

  constructor(message?: MessageEntity) {
    this.id = message?.id;
    this.content = message?.content;
    this.chat = message?.chat;
  }
}
