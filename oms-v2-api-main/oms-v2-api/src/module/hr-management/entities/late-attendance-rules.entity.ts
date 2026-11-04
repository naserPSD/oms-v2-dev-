import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Office } from './office.entity';

@Entity({ name: 'late_attendance_rules', synchronize: true })
export class LateAttendanceRule {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'office_id', type: 'int', unsigned: true, nullable: true })
  officeId?: number | null;

  @ManyToOne(() => Office, { nullable: true })
  @JoinColumn({ name: 'office_id' })
  office?: Office;

  @Column({ name: 'min_late_minutes', type: 'int' })
  minLateMinutes: number;

  @Column({ name: 'max_late_minutes', type: 'int', nullable: true })
  maxLateMinutes?: number | null;

  @Column({
    name: 'fine_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  fineAmount?: number | null;

  @Column({
    name: 'fine_interval_days',
    type: 'int',
    nullable: true,
    default: 1,
    comment: '1 = per day, N = per N late days',
  })
  fineIntervalDays?: number | null;

  @Column({
    name: 'is_absent',
    type: 'tinyint',
    width: 1,
    nullable: true,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
    default: 0,
  })
  isAbsent?: boolean | null;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    nullable: true,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
    default: 1,
  })
  isActive?: boolean | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
