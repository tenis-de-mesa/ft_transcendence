import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '.';

@Entity({ name: 'friendRequests' })
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.friendRequestsReceived)
  @JoinColumn({ name: 'receiverId' })
  receiver: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.friendRequestsSent)
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;
}
