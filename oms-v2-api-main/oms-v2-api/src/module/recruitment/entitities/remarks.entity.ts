import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@module/users/entities/user.entity';

@Entity({ name: 'remarks' })
export class Remark {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entity: string;

  @Column({ name: 'entity_id', type: 'int', unsigned: true, nullable: true })
  entityId: number;

  @Column({ name: 'type_id', type: 'int', unsigned: true, nullable: true })
  typeId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'creator_id', type: 'int', unsigned: true, nullable: true })
  creatorId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
