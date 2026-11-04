import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppHoliday } from './app-holidays.entity';

@Entity({ name: 'app_holiday_dates', synchronize: false })
export class AppHolidayDate {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'app_holiday_id',
    type: 'int',
    unsigned: true,
  })
  appHolidayId: number;

  @ManyToOne(() => AppHoliday, { nullable: false })
  @JoinColumn({
    name: 'app_holiday_id',
  })
  appHoliday: AppHoliday;

  @Column({
    name: 'holiday_date',
    type: 'date',
  })
  holidayDate: string;
}
