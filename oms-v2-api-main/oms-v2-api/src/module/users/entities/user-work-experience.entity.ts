import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from '@module/address/entities/address.entity';

@Entity('user_work_experiences', { synchronize: true })
export class UserWorkExperience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'job_title', type: 'varchar', length: 128, nullable: true })
  jobTitle: string | null;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
    name: 'company_name',
  })
  companyName: string | null;

  @Column({
    name: 'responsibility',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  responsibility: string | null;

  @Column({ name: 'address_id', type: 'int', unsigned: true, nullable: true })
  addressId: number | null;

  @ManyToOne(() => Address, { eager: false })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date | null;

  @Column({
    name: 'is_current',
    type: 'tinyint',
    width: 1,
    nullable: true,
    default: () => '0',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isCurrent: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
