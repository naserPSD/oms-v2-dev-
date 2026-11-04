import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';

@Entity({ name: 'emp_pay_items', synchronize: true })
export class EmpPayItem {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'app_id',
  })
  application?: Application;

  @Column({ name: 'item_code', type: 'varchar', length: 50 })
  itemCode: string;

  @Column({ name: 'item_name', type: 'varchar', length: 100 })
  itemName: string;

  @Column({
    name: 'pay_item_type_id',
    type: 'int',
    unsigned: true,
    default: 194,
  })
  payItemTypeId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'pay_item_type_id' })
  payItemType?: Status;

  @Column({
    name: 'pay_item_category_id',
    type: 'int',
    unsigned: true,
    default: 200,
  })
  payItemCategoryId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'pay_item_category_id' })
  payItemCategory?: Status;

  @Column({
    name: 'recurrence_type_id',
    type: 'int',
    unsigned: true,
    default: 201,
  })
  recurrenceTypeId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'recurrence_type_id' })
  recurrenceType?: Status;

  @Column({
    name: 'recurrence_count',
    type: 'int',
    unsigned: true,
    default: 1,
  })
  recurrenceCount: number;

  @Column({
    name: 'calculation_method_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    // default: 204,
  })
  calculationMethodId?: number | null;

  @ManyToOne(() => Status, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'calculation_method_id' })
  calculationMethod?: Status;

  @Column({
    name: 'calc_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  calcValue?: number | null;

  // --- New Fields Start ---

  @Column({
    name: 'affects_gross_salary',
    type: 'tinyint',
    default: 1,
    comment: 'Whether this item affects gross salary calculation',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  affectsGrossSalary: boolean;

  @Column({
    name: 'affects_net_salary',
    type: 'tinyint',
    default: 1,
    comment: 'Whether this item affects net salary calculation',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  affectsNetSalary: boolean;

  @Column({
    name: 'is_statutory',
    type: 'tinyint',
    default: 0,
    comment: 'Whether this is a statutory requirement (PF, PT, ESI, etc.)',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isStatutory: boolean;

  @Column({
    name: 'is_taxable',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isTaxable: boolean;

  @Column({
    name: 'tax_section',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Income Tax Section under which this falls (e.g., 80C for PF)',
  })
  taxSection?: string | null;

  @Column({
    name: 'max_limit',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Maximum limit for this item if applicable',
  })
  maxLimit?: number | null;

  @Column({
    name: 'min_limit',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Minimum limit for this item if applicable',
  })
  minLimit?: number | null;

  // --- New Fields End ---

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', nullable: true, default: 0 })
  sortOrder?: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 6, // Updated to match TIMESTAMP(6)
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt?: Date | null;

  @BeforeInsert()
  beforeInsert() {
    this.id = Number(this.id);
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.id = Number(this.id);
  }

  @AfterLoad()
  afterLoad() {
    this.id = Number(this.id);
  }
}
