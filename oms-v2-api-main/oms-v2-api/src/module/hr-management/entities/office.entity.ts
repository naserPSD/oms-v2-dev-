import { Address } from '@module/address/entities/address.entity';
import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { OfficeShift } from './office-shift.entity';
import { OfficeWeekend } from './office-weekends.entity';

@Entity({ name: 'offices', synchronize: true })
export class Office {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // Application relation
  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  // Office type (Status) relation
  @Column({ name: 'type_id', type: 'int', unsigned: true, nullable: true })
  typeId: number | null;

  @ManyToOne(() => Status, { eager: true, nullable: true })
  @JoinColumn({ name: 'type_id' })
  officeType?: Status;

  @Index('idx_office_name')
  @Column({ length: 128, comment: 'Name of office ' })
  name: string;

  // Address FK
  @Column({
    name: 'address_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: 'Foreign key to address',
  })
  addressId: number | null;

  @ManyToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id' })
  address: Address | null;

  @Column({
    name: 'manager_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: null,
  })
  managerId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: User;

  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: null,
  })
  creatorId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  // Editor
  @Column({
    name: 'editor_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: null,
  })
  editorId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'editor_id' })
  editor?: User;

  // Shift fields
  @Column({
    name: 'has_shift',
    type: 'boolean',
    default: false,
    comment: 'Whether this office has shift schedules',
  })
  hasShift: boolean;

  @Column({
    name: 'start_time',
    type: 'time',
    precision: 0,
    nullable: true,
    comment: 'Standard start time for shifts',
  })
  startTime: string | null;

  @Column({
    name: 'delay_start_time',
    type: 'time',
    precision: 0,
    nullable: true,
    comment: 'Latest allowed start time',
  })
  delayStartTime: string | null;

  @Column({
    name: 'end_time',
    type: 'time',
    precision: 0,
    nullable: true,
    comment: 'Standard end time for shifts',
  })
  endTime: string | null;

  @Column({
    name: 'early_end_time',
    type: 'time',
    precision: 0,
    nullable: true,
    comment: 'Earliest allowed end time',
  })
  earlyEndTime: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'IANA timezone identifier (e.g., America/New_York)',
  })
  timezone: string | null;

  @CreateDateColumn({
    name: 'created_at',
    precision: 0,
    comment: 'Record creation timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    precision: 0,
    nullable: true,
    comment: 'Record last update timestamp',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    precision: 0,
    nullable: true,
    comment: 'Soft delete timestamp',
  })
  deletedAt: Date | null;

  @OneToMany(() => OfficeWeekend, (officeWeekend) => officeWeekend.office)
  officeWeekends: OfficeWeekend[];

  @OneToMany(() => OfficeShift, (officeShift) => officeShift.office)
  officeShifts: OfficeShift[];
}
