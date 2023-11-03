import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'games' })
export class GameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  player1: number;

  @Column()
  player2: number;

  @Column()
  score1: number;

  @Column()
  score2: number;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user1: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user2: UserEntity;

  constructor(game?: GameEntity) {
    this.id = game?.id;
    this.player1 = game?.player1;
    this.player2 = game?.player2;
    this.score1 = game?.score1;
    this.score2 = game?.score2;
  }
}
