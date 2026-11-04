import { Country } from '@module/country/entities/country.entity';
import { Office } from '@module/hr-management/entities/office.entity';
import { User } from '@module/users/entities/user.entity';
import { Exclude, Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum AddressType {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  OTHER = 'Other',
}

@Entity('addresses', { synchronize: true })
export class Address {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Index('idx_addresses_module')
  @Column({
    name: 'module',
    type: 'varchar',
    nullable: true,
    length: 50,
    comment: 'Module name this address belongs to (e.g., "office", "user") ',
  })
  module: string;

  @Index('idx_addresses_module_id')
  @Column({
    name: 'module_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment:
      'ID of the entity this address belongs to (e.g., office ID, user ID)',
  })
  module_id: number;

  @Column({ length: 255, type: 'varchar', nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: AddressType,
    name: 'address_type',
    default: AddressType.COMMERCIAL,
  })
  addressType: AddressType;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 128, nullable: true })
  email: string;

  @Column({ length: 128, nullable: true })
  city: string;

  @Column({ name: 'postal_code', length: 24, nullable: true })
  postalCode: string;

  @Column({ name: 'country_id', type: 'int', unsigned: true, nullable: true })
  countryId: number;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'country_id' })
  // @Exclude()
  @Expose({ groups: ['withCountry'] }) // ✅ only show country if "withCountry" group is used
  country: Country | null;

  @Column({ length: 50, nullable: true })
  timezone: string;

  @Column({ name: 'gmap_latitude', length: 50, nullable: true })
  gmapLatitude: string;

  @Column({ name: 'map_link', type: 'text', nullable: true })
  mapLink: string;

  @Column({ name: 'gmap_longitude', length: 50, nullable: true })
  gmapLongitude: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Expose()
  get countryName(): string {
    if (this.country) return this.country.name;
    return '';
  }
}
