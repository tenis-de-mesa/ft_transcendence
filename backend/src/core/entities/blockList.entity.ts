import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'blockList' })
export class BlockListEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  userBlockedId: number;

  @CreateDateColumn()
  createdAt: Date;

  constructor(blockList?: BlockListEntity) {
    this.userId = blockList?.userId;
    this.userBlockedId = blockList?.userBlockedId;
  }
}
