import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../../status/entities/status.entity';

@Entity('status_groups', { synchronize: true })
export class StatusGroup {
  @Index('idx_status_group_id')
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  code: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: true,
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 6,
    nullable: true,
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;

  @OneToMany(() => Status, (status) => status.statusGroup)
  statuses: Status[];
}
