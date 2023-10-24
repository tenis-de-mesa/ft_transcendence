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
  blockedById: number;

  @PrimaryColumn()
  blockedUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedById', referencedColumnName: 'id' })
  blockedBy: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedUserId', referencedColumnName: 'id' })
  blockedUser: UserEntity;

  constructor(blockList?: BlockListEntity) {
    this.blockedById = blockList?.blockedById;
    this.blockedUserId = blockList?.blockedUserId;
    this.createdAt = blockList?.createdAt;
  }
}
