import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Country } from '@module/country/entities/country.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'user_educations', synchronize: true })
export class UserEducation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'institute_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  instituteName: string | null;

  @Column({
    name: 'is_foreign_institute',
    type: 'tinyint',
    unsigned: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isForeignInstitute: boolean;

  @Column({
    name: 'institute_country_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  instituteCountryId: number;

  @ManyToOne(() => Country, { eager: false })
  @JoinColumn({ name: 'institute_country_id' })
  instituteCountry: Country;

  @Column({
    name: 'education_level_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  educationLevelId: number | null;

  @ManyToOne(() => Status, { eager: false })
  @JoinColumn({ name: 'education_level_id' })
  educationLevel: Status;

  @Column({ name: 'group_id', type: 'int', unsigned: true, nullable: true })
  groupId: number | null;

  @ManyToOne(() => Status, { eager: false })
  @JoinColumn({ name: 'group_id' })
  group: Status;

  @Column({
    name: 'duration',
    type: 'int',
    nullable: true,
    comment: 'Duration in years',
  })
  duration: number | null;

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

  @Column({ name: 'year_of_passing', type: 'int', nullable: true })
  yearOfPassing: number | null;

  @Column({
    name: 'result_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  resultTypeId: number | null;

  @ManyToOne(() => Status, { eager: false })
  @JoinColumn({ name: 'result_type_id' })
  resultType: Status;

  @Column({ name: 'result', type: 'varchar', length: 10, nullable: true })
  result: string;

  @Column({ name: 'serial', type: 'int', nullable: true })
  serial: number | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Expose()
  instituteCountryName: any;

  @Expose()
  educationLevelName: any;

  @Expose()
  resultTypeName: any;

  @Expose()
  groupName: any;
}
