import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  Index,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { Department } from './departments.entity';

@Index('IDX_DESIGNATIONS_APP_ID', ['appId'])
@Entity({ name: 'designations', synchronize: true })
export class Designation {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
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
  application?: Application;


  @Column({
    name: 'name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'department_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  departmentId: number | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({
    name: 'level',
    type: 'int',
    nullable: true,
  })
  level: number | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isActive: boolean;

  @Column({
    name: 'creator_id',
    type: 'int',
    nullable: true,
  })
  creatorId: number | null;

  @Column({
    name: 'updater_id',
    type: 'int',
    nullable: true,
  })
  updaterId: number | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
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

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  // @Expose()
  // department: any;
}
