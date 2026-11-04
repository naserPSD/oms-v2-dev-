import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  In,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'emp_leave_types', synchronize: false })
@Index('idx_emp_leave_types_app_name_year', ['appId', 'name', 'year'], {
  unique: true,
})
export class EmpLeaveType {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
  })
  appId: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 256,
  })
  name: string;

  @Column({
    name: 'is_paid',
    type: 'tinyint',
    width: 1,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isPaid: boolean;

  @Column({
    name: 'max_days_per_year',
    type: 'int',
    unsigned: true,
  })
  maxDaysPerYear: number;

  @Column({
    name: 'year',
    type: 'smallint',
    unsigned: true,
  })
  year: number;

  @Column({
    name: 'requires_approval',
    type: 'tinyint',
    width: 1,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  requiresApproval: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;
}
