import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusGroup } from '../../status-group/entities/status-group.entity';

@Entity({ name: 'statuses', synchronize: true })
export class Status {
  @Index('idx_status_id')
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  // @Column({ unsigned: true, type: 'int' })
  // status_group_id: number;

  @ManyToOne(() => StatusGroup, (statusGroup) => statusGroup.statuses, {
    eager: false,
  })
  @JoinColumn({ name: 'status_group_id' })
  statusGroup: StatusGroup;

  @Index('idx_status_name')
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Values must be capital letters.',
  })
  @Index({ unique: true }) // Unique constraint on the 'code' column
  code: string;

  @Column({
    name: 'color_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  colorName: string;

  @Column({ name: 'data', type: 'json', nullable: true }) // ✅ Use 'json' instead of 'text'
  data: object; // ✅ Type as 'object' to store JSON

  @Column({ name: 'serial', unsigned: true, type: 'int', nullable: true })
  serial: number;

  @Index()
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
    nullable: true,
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;
}
