import { Subscription } from '@module/subscription/entities/subscription.entity';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'subscription_users', synchronize: true })
@Index('unique_subscription_user', ['subscriptionId', 'userId'], {
  unique: true,
})
export class SubscriptionUser {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'subscription_id', type: 'int', unsigned: true })
  subscriptionId: number;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    nullable: true,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isActive: boolean;

  @Column({
    name: 'added_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  addedBy?: number | null;

  @Column({
    name: 'added_at',
    type: 'datetime',
    nullable: true,
  })
  addedAt?: Date | null;

  @Column({
    name: 'removed_at',
    type: 'datetime',
    nullable: true,
  })
  removedAt?: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;
}
