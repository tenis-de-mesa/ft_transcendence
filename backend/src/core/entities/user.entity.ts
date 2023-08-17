import { Entity, Column, PrimaryColumn } from 'typeorm';

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
}
