import { Status } from '@module/status/entities/status.entity';
import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  Index,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';

@Index('IDX_SERVICES_APP_ID', ['appId'])
@Index('IDX_SERVICES_CREATOR_ID', ['creatorId'])
@Index('IDX_SERVICES_TYPE_ID', ['typeId'])
@Index('UQ_SERVICES_APP_TYPE_ACTIVE_NAME', ['appId', 'typeId', 'activeName'], {
  unique: true,
})
@Entity({ name: 'services', synchronize: true })
export class Service {
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
  appId: number | null;
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
    name: 'type_id',
    type: 'int',
    nullable: true,
  })
  typeId: number | null;

  @Expose()
  @OneToOne(() => Status, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'type_id', referencedColumnName: 'id' })
  type: Status | null;

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

  @Column({
    name: 'active_name',
    type: 'varchar',
    length: 50,
    nullable: true,
    asExpression:
      'CASE WHEN `deleted_at` IS NULL THEN TRIM(`name`) ELSE NULL END',
    generatedType: 'VIRTUAL',
    select: false,
    insert: false,
    update: false,
  })
  activeName: string | null;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
