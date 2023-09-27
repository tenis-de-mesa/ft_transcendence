import { UserEntity } from '.';
import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'friend_requests' })
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.friend_requests_received)
  @JoinColumn({ name: 'receiver_id' })
  receiver: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.friend_requests_sent)
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;
}
