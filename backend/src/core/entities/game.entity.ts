import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum GameStatus {
  START = 'start',
  FINISH = 'finish',
}
@Entity({ name: 'games' })
export class GameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  score1: number;

  @Column({ default: 0 })
  score2: number;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.START,
  })
  status: GameStatus;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  constructor(game?: GameEntity) {
    this.id = game?.id;
    this.score1 = game?.score1;
    this.score2 = game?.score2;
    this.users = game?.users;
  }
}
