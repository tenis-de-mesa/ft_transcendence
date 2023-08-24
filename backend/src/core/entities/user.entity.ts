import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Session } from './session.entity';

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

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
