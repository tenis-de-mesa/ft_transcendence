import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { FriendRequest } from './friend_request.entity'
import { ApiHideProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column()
  login: string;

  @ApiHideProperty()
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

  @ApiHideProperty()
  @OneToMany(() => FriendRequest, (friend_request) => friend_request.receiver)
  friend_requests_received: FriendRequest[];

  @ApiHideProperty()
  @OneToMany(() => FriendRequest, (friend_request) => friend_request.sender)
  friend_requests_sent: FriendRequest[];
}
