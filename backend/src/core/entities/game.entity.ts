import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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
  playerOneScore: number;

  @Column({ default: 0 })
  playerTwoScore: number;

  @Column({ default: 10 })
  maxScore: number;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.START,
  })
  status: GameStatus;

  @ManyToOne(() => UserEntity)
  playerOne: UserEntity;

  @ManyToOne(() => UserEntity)
  playerTwo: UserEntity;

  @ManyToOne(() => UserEntity)
  winner: UserEntity;

  @ManyToOne(() => UserEntity)
  loser: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  constructor(game?: GameEntity) {
    this.id = game?.id;
    this.playerOneScore = game?.playerOneScore;
    this.playerTwoScore = game?.playerTwoScore;
    this.playerOne = game?.playerOne;
    this.playerTwo = game?.playerTwo;
    this.maxScore = game?.maxScore;
    this.status = game?.status;
    this.createdAt = game?.createdAt;
  }
}
