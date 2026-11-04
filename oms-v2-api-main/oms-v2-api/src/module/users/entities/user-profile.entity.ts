//src/module/users/entities/user-profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Media } from '@module/media/entities/media.entity';
import { Exclude, Expose } from 'class-transformer';
import { Country } from '@module/country/entities/country.entity';
import AuditableEntity from '@common/listeners/auditable-entity';

@Entity({ name: 'user_profiles', synchronize: true })
export class UserProfile extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    unique: true,
    nullable: true,
  })
  userId: number;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @Column({ name: 'user_id', nullable: true })
  // userId: number;

  // // Optional one-to-one relationship
  // @OneToOne(() => User, (user) => user.profile, {
  //   createForeignKeyConstraints: false,
  // })
  // @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  // user: User;

  @Column({
    name: 'profile_picture_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  profilePictureId?: number | null;

  @Column({ name: 'country_id', type: 'int', unsigned: true, nullable: true })
  countryId: number | null;

  @Column({
    name: 'phone_country_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  phoneCountryId: number | null;

  @Index('idx_user_profile_phone')
  @Column({ type: 'varchar', length: 32, nullable: true })
  phone?: string | null;

  @Column({ name: 'present_address_id', type: 'int', nullable: true })
  presentAddressId?: number | null;

  @Column({ name: 'permanent_address_id', type: 'int', nullable: true })
  permanentAddressId?: number | null;

  @Column({ name: 'marital_status_id', type: 'int', nullable: true })
  maritalStatusId?: number | null;

  @Column({ name: 'religion_id', type: 'int', nullable: true })
  religionId?: number | null;

  @Column({
    type: 'enum',
    enum: ['Female', 'Male', 'Other'],
    nullable: true,
  })
  gender: string | null;

  // @Column({ name: 'is_married', default: 0 })
  // isMarried: boolean;

  @Column({
    name: 'passport_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passportNumber?: string | null;

  @Column({ name: 'nid_number', type: 'varchar', length: 255, nullable: true })
  nidNumber?: string | null;

  @Column({ name: 'blood_group_id', type: 'int', nullable: true })
  bloodGroupId?: number | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({
    name: 'linkedin_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  linkedinUrl?: string | null;

  @Column({
    name: 'portfolio_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  portfolioUrl?: string | null;

  @Column({
    name: 'github_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  githubUrl?: string | null;

  @Column({ name: 'willing_to_relocate', default: 0 })
  willingToRelocate: boolean;

  @Column({ name: 'remote_only', default: 0 })
  remoteOnly: boolean;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  // Optional one-to-one relationship
  @OneToOne(() => Media, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'profile_picture_id', referencedColumnName: 'id' })
  profilePicture: Media | null;

  @Column({
    name: 'fathers_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fathersName?: string | null;

  @Column({
    name: 'mothers_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mothersName?: string | null;

  @OneToOne(() => Country, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'phone_country_id', referencedColumnName: 'id' })
  @Exclude({ toPlainOnly: true })
  phoneCountry: Country | null;

  @Expose()
  get phoneWithCallingCode(): string {
    if (this.phone && this.phoneCountryId) {
      return `+${this.phoneCountry?.callingCode}${this.phone}`;
    }
    return '';
  }

  @Expose()
  bloodGroupName: any;

  @Expose()
  maritalStatusName: any;

  @Expose()
  religionName: any;

  @ManyToOne(() => Country, {
    nullable: true,
  })
  @JoinColumn({ name: 'country_id' })
  country: Country | null;
}
