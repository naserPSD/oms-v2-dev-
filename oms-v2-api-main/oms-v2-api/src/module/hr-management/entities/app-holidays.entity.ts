import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { Holiday } from './holiday.entity';
import { Status } from '@module/status/entities/status.entity';
import { AppHolidayDate } from './app-holiday-dates.entity';
import { Expose } from 'class-transformer';

@Entity({ name: 'app_holidays', synchronize: false })
export class AppHoliday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'app_id',
  })
  application?: Application;

  @Column({
    name: 'holiday_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  holidayId?: number | null;

  @ManyToOne(() => Holiday, { nullable: true })
  @JoinColumn({ name: 'holiday_id' })
  holiday?: Holiday;

  @Column({
    name: 'holiday_type_id',
    type: 'int',
    nullable: true,
  })
  holidayTypeId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'holiday_type_id' })
  holidayType?: Status;

  @Column({
    name: 'holiday_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  holidayName?: string | null;

  @Column({
    name: 'day_count',
    type: 'tinyint',
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: number) => value,
    },
    default: 1,
  })
  dayCount?: number | null;

  @Column({
    name: 'is_recurring',
    type: 'tinyint',
    default: 0,
    comment: 'Whether it repeats annually',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
  })
  isRecurring: boolean;

  @Column({
    name: 'is_official',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
    comment: 'Whether it’s an official day off',
  })
  isOfficial: boolean;

  @Column({
    name: 'creator_id',
    type: 'int',
    nullable: true,
  })
  creatorId?: number | null;

  @Column({
    name: 'editor_id',
    type: 'int',
    nullable: true,
  })
  editorId?: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;

  @OneToMany(
    () => AppHolidayDate,
    (appHolidayDates) => appHolidayDates.appHoliday,
  )
  appHolidayDates: AppHolidayDate[];

  @Expose()
  get holidayDates(): string[] {
    const appHolidayDates = this.appHolidayDates || [];
    return appHolidayDates
      .map((appHolidayDate) => appHolidayDate.holidayDate)
      .sort((a, b) => a.localeCompare(b));
  }
}
