import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  In,
} from 'typeorm';
import { User } from '@module/users/entities/user.entity';

import { Status } from '@module/status/entities/status.entity';
import { Department } from '@module/application/entities/departments.entity';
import { Employee } from './employees.entity';
import { UserProfile } from '@module/users/entities/user-profile.entity';
import { Application } from '@module/application/entities/application.entity';

export enum RequisitionType {
  IN_STOCK = 'in_stock',
  NEW = 'new',
}

@Entity({ name: 'requisitions', synchronize: true })
export class Requisition {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app?: Application;

  @Column({
    name: 'requisition_no',
    type: 'varchar',
    length: 50,
  })
  requisitionNo: string;

  @Column({
    name: 'employee_id',
    type: 'int',
    unsigned: true,
  })
  employeeId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'department_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  departmentId?: number | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({
    name: 'requisition_date',
    type: 'datetime',
  })
  requisitionDate: Date;

  @Column({
    name: 'item_description',
    type: 'text',
  })
  itemDescription: string;

  @Column({
    name: 'requisition_type',
    type: 'enum',
    enum: RequisitionType,
    default: RequisitionType.NEW,
  })
  requisitionType: RequisitionType;

  @Column({
    name: 'quantity',
    type: 'int',
    unsigned: true,
  })
  quantity: number;

  @Column({
    name: 'unit_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: null,
  })
  unitTypeId?: number;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'unit_type_id' })
  unitType?: Status;

  @Column({
    name: 'estimated_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  estimatedCost?: number | null;

  @Column({
    name: 'status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: 138,
  })
  statusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'status_id' })
  status?: Status;

  @Column({
    name: 'approved_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  approvedBy?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedByUser?: User;

  @Column({
    name: 'approved_date',
    type: 'date',
    nullable: true,
  })
  approvedDate?: Date | null;

  @Column({
    name: 'remarks',
    type: 'text',
    nullable: true,
  })
  remarks?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt?: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;
}
