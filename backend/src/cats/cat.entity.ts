// https://docs.nestjs.com/techniques/database#repository-pattern

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ default: 'Mixed' })
  breed: string;

  @CreateDateColumn()
  createdAt: Date;
}
