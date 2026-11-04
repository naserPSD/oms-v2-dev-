import { Office } from '@module/hr-management/entities/office.entity';
import { Expose } from 'class-transformer';
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
import { Application } from '@module/application/entities/application.entity';
import { OfficeShift } from './office-shift.entity';

@Entity({ name: 'office_weekends', synchronize: false })
export class OfficeWeekend {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Index('idx_office_weekends_app_id')
  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
  })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Index('idx_office_weekends_office_id')
  @Column({
    name: 'office_id',
    type: 'int',
    unsigned: true,
  })
  officeId: number;

  @ManyToOne(() => Office, { nullable: true })
  @JoinColumn({ name: 'office_id' })
  office?: Office | null;

  @Column({
    name: 'shift_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  shiftId?: number | null;

  @ManyToOne(() => OfficeShift, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift?: OfficeShift | null;

  @Column({
    name: 'saturday',
    type: 'tinyint',
    default: 0,
  })
  saturday: number;

  @Column({
    name: 'sunday',
    type: 'tinyint',
    default: 0,
  })
  sunday: number;

  @Column({
    name: 'monday',
    type: 'tinyint',
    default: 0,
  })
  monday: number;

  @Column({
    name: 'tuesday',
    type: 'tinyint',
    default: 0,
  })
  tuesday: number;

  @Column({
    name: 'wednesday',
    type: 'tinyint',
    default: 0,
  })
  wednesday: number;

  @Column({
    name: 'thursday',
    type: 'tinyint',
    default: 0,
  })
  thursday: number;

  @Column({
    name: 'friday',
    type: 'tinyint',
    default: 0,
  })
  friday: number;

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

  @Expose()
  officeInfo?: { name: string | null };
}
