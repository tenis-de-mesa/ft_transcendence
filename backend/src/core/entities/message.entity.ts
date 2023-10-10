import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatEntity, UserEntity } from '.';

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages)
  chat: ChatEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  constructor(message?: MessageEntity) {
    this.id = message?.id;
    this.content = message?.content;
    this.chat = message?.chat;
  }
}
