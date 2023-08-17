import { User } from 'src/core/entities/user.entity';
import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'friend_requests' })
export class FriendRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.friend_requests_received)
    @JoinColumn({ name: "receiver_id" })
    receiver: User

    @ManyToOne(() => User, (user) => user.friend_requests_sent)
    @JoinColumn({ name: "sender_id" })
    sender: User
}
