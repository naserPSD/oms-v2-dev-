import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'password_resets', synchronize: true })
export class PasswordReset {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
  })
  userId: number;

  @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_id', type: 'varchar', length: 255 })
  sessionId: string;

  @Column({
    name: 'expired_date_time',
    type: 'datetime',
    default: null,
    nullable: true,
  })
  expiredDateTime: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
