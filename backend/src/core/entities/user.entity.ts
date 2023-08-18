import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { FriendRequest } from 'src/friend_requests/entities/friend_request.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column()
  login: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'friends',
    joinColumn: {
      name: 'user_id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
    },
  })
  friends: User[];

  @OneToMany(() => FriendRequest, (friend_request) => friend_request.receiver)
  friend_requests_received: FriendRequest[];

  @OneToMany(() => FriendRequest, (friend_request) => friend_request.sender)
  friend_requests_sent: FriendRequest[];
}
