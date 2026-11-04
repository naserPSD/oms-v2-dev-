import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('countries', { synchronize: true })
export class Country {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true, type: 'int' })
  id: number;

  @Column({ name: 'capital', type: 'varchar', length: 255, nullable: true })
  capital: string | null;

  @Column({ name: 'citizenship', type: 'varchar', length: 255, nullable: true })
  citizenship: string | null;

  @Column({ name: 'language', type: 'varchar', length: 255, nullable: true })
  language: string | null;

  @Column({ name: 'country_code', type: 'char', length: 3, default: '' })
  countryCode: string;

  @Column({ name: 'currency', type: 'varchar', length: 255, nullable: true })
  currency: string | null;

  @Column({
    name: 'currency_code',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  currencyCode: string | null;

  @Column({
    name: 'currency_sub_unit',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  currencySubUnit: string | null;

  @Column({ name: 'currency_symbol', type: 'char', length: 3, nullable: true })
  currencySymbol: string | null;

  @Column({ name: 'currency_decimals', type: 'int', nullable: true })
  currencyDecimals: number | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ name: 'iso_3166_2', type: 'char', length: 2, default: '' })
  iso31662: string;

  @Column({ name: 'iso_3166_3', type: 'char', length: 3, default: '' })
  iso31663: string;

  @Column({ name: 'name', type: 'varchar', length: 255, default: '' })
  name: string;

  @Column({ name: 'region_code', type: 'char', length: 3, default: '' })
  regionCode: string;

  @Column({ name: 'sub_region_code', type: 'char', length: 3, default: '' })
  subRegionCode: string;

  @Column({ name: 'eea', type: 'tinyint', width: 1, default: 0 })
  eea: boolean;

  @Column({ name: 'calling_code', type: 'varchar', length: 3, nullable: true })
  callingCode: string | null;

  @Column({ name: 'flag', type: 'varchar', length: 6, nullable: true })
  flag: string | null;

  @Column({ name: 'status', type: 'int', default: 0 })
  status: number;

  @Column({ name: 'status_by', type: 'int', nullable: true })
  statusBy: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
