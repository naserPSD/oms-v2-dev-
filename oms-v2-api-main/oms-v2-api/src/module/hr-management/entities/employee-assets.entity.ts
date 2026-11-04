import { Status } from '@module/status/entities/status.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { CompanyAssetType } from './company-asset-types.entity';
import { Employee } from './employees.entity';
import { Expose } from 'class-transformer';

@Entity({ name: 'employee_assets', synchronize: true })
export class EmployeeAsset {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
  })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({
    name: 'employee_id',
    type: 'int',
    unsigned: true,
  })
  employeeId: number;

  @ManyToOne(() => Employee, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'asset_type_id',
    type: 'int',
    unsigned: true,
  })
  assetTypeId: number;

  @ManyToOne(() => CompanyAssetType, { eager: false })
  @JoinColumn({ name: 'asset_type_id' })
  assetType: CompanyAssetType;

  @Column({
    name: 'asset_status_id',
    type: 'int',
    unsigned: true,
    default: 143,
  })
  assetStatusId: number;

  @ManyToOne(() => Status, { eager: false })
  @JoinColumn({ name: 'asset_status_id' })
  assetStatus: Status;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  model?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  serial?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amount?: number;

  @Column({
    name: 'is_refundable',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  isRefundable: boolean;

  @Column({
    name: 'allocation_date',
    type: 'datetime',
    nullable: true,
  })
  allocationDate?: Date;

  @Column({
    name: 'withdrawal_date',
    type: 'datetime',
    nullable: true,
  })
  withdrawalDate?: Date;

  @Column({
    name: 'remarks',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  remarks?: string;

  @Column({
    name: 'allocated_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  allocatedBy: number | null;

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
  updatedAt: Date | null;

  @Expose()
  currency: string;

  @Expose()
  amountWithCurrency: string;
}
