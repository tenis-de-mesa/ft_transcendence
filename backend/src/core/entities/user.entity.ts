import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Session } from '.';

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

  @Column('varchar', {
    array: true,
    nullable: true,
  })
  tfaRecoveryCodes: string[];

  @OneToMany(() => Session, (session) => session.user, {
    eager: true,
  })
  sessions: Session[];
}
