import { Helpers } from '@core/utils/helpers';
import { Office } from '@module/hr-management/entities/office.entity';
import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { OfficeWeekend } from './office-weekends.entity';

@Entity({ name: 'office_shifts', synchronize: false })
export class OfficeShift {
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
    name: 'office_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  officeId?: number | null;

  @ManyToOne(() => Office, { nullable: true })
  @JoinColumn({ name: 'office_id' })
  office?: Office | null;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'start_time',
    type: 'time',
    nullable: true,
  })
  startTime: string | null;

  @Column({
    name: 'delay_start_time',
    type: 'time',
    nullable: true,
  })
  delayStartTime: string | null;

  @Column({
    name: 'end_time',
    type: 'time',
    nullable: true,
  })
  endTime: string | null;

  @Column({
    name: 'early_end_time',
    type: 'time',
    nullable: true,
  })
  earlyEndTime: string | null;

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

  // @Expose()
  // officeInfo?: {
  //   name: string | null;
  // };

  @Expose()
  get totalOfficeHour(): number {
    if (!this.startTime || !this.endTime) {
      return 0;
    }

    return Helpers.getHoursBetweenTime(this.startTime, this.endTime);
  }

  @OneToMany(() => OfficeWeekend, (weekend) => weekend.shift)
  weekends: OfficeWeekend[];
}
