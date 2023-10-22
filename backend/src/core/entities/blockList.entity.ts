import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'blockList' })
export class BlockListEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  userBlockedId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  userBlocker: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userBlockedId', referencedColumnName: 'id' })
  userBlocked: UserEntity;

  constructor(blockList?: BlockListEntity) {
    this.userId = blockList?.userId;
    this.userBlockedId = blockList?.userBlockedId;
  }
}
