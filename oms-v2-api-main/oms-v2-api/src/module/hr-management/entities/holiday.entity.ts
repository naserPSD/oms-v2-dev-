import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import { Transform } from 'class-transformer';

@Entity({ name: 'holidays', synchronize: false })
export class Holiday {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    name: 'holiday_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  holidayTypeId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({
    name: 'holiday_type_id',
  })
  holidayType?: Status;

  @Column({
    name: 'holiday_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  holidayName?: string | null;

  @Column({
    name: 'total_holidays',
    type: 'tinyint',
    nullable: true,
  })
  totalHolidays?: number | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    nullable: true,
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
  creatorId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  @Column({
    name: 'editor_id',
    type: 'int',
    nullable: true,
  })
  editorId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'editor_id' })
  editor?: User;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt?: Date | null;
}
