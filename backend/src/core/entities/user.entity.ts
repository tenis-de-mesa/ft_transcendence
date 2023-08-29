import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { FriendRequest } from './friend_request.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Session } from '.';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ default: false })
  tfaEnabled: boolean;

  @Column({ nullable: true })
  tfaSecret: string;

  @Column('varchar', {
    array: true,
    nullable: true,
  })
  tfaRecoveryCodes: string[];

  @OneToMany(() => Session, (session) => session.user, {
    eager: true,
  })
  sessions: Session[];

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
