import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column()
  login: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: "friends", // table name for the junction table of this relation
    joinColumn: {
      name: "user_id",
    },
    inverseJoinColumn: {
      name: "friend_id",
    },
  })
  friends: User[];
}
