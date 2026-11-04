import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Status } from '@module/status/entities/status.entity';

@Index('IDX_USER_TRAININGS_USER_ID', ['userId'])
@Entity({ name: 'user_trainings', synchronize: true })
export class UserTraining {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
  })
  userId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 128,
  })
  name: string;

  @Column({
    name: 'training_year',
    type: 'int',
    nullable: true,
  })
  trainingYear: number | null;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'start_date',
    type: 'date',
    nullable: true,
  })
  startDate: Date | null;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
  })
  endDate: Date | null;

  @Column({
    name: 'is_current',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isCurrent: boolean;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @Column({
    name: 'location_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  locationName: string | null;

  @Column({
    name: 'training_type',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  trainingType: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'training_type' })
  trainingTypeStatus: Status | null;

  @Column({
    name: 'quantity',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  quantity: number | null;

  @Column({
    name: 'estimated_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  estimatedCost: number | null;

  @Column({
    name: 'course_duration',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  courseDuration: string | null;

  @Column({
    name: 'reason',
    type: 'text',
    nullable: true,
  })
  reason: string | null;

  @Column({
    name: 'additional_notes',
    type: 'text',
    nullable: true,
  })
  additionalNotes: string | null;

  @Column({
    name: 'status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  statusId: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'status_id' })
  status: Status | null;

  @Column({
    name: 'approved_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  approvedBy: number | null;

  @Column({
    name: 'approved_date',
    type: 'date',
    nullable: true,
  })
  approvedDate: Date | null;

  @Column({
    name: 'remarks',
    type: 'text',
    nullable: true,
  })
  remarks: string | null;

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

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
