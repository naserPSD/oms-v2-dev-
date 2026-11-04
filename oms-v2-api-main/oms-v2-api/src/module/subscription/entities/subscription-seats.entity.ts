import { Subscription } from '@module/subscription/entities/subscription.entity';
import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';

@Entity({ name: 'subscription_seats', synchronize: true })
export class SubscriptionSeat {
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

  @Column({
    name: 'total_seats',
    type: 'int',
    default: 1,
  })
  totalSeats: number;

  @Column({
    name: 'used_seats',
    type: 'int',
    default: 0,
  })
  usedSeats: number;

  @Column({
    name: 'available_seats',
    type: 'int',
    default: 1,
  })
  availableSeats: number;

  @Column({
    name: 'seat_history',
    type: 'longtext',
    nullable: true,
    comment: 'JSON array of seat history',
  })
  seatHistory?: any | null;

  @Column({
    name: 'last_updated',
    type: 'datetime',
    nullable: true,
  })
  lastUpdated?: Date | null;

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
