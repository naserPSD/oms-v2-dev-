import { Media } from '@module/media/entities/media.entity';
import { User } from '@module/users/entities/user.entity';
import { AppUser } from '@module/users/entities/app-user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Status } from '@module/status/entities/status.entity';
import { Country } from '@module/country/entities/country.entity';

@Entity({ name: 'applications', synchronize: true })
export class Application {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isActive: boolean;

  @Column({
    name: 'type_id',
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  typeId: number;

  @ManyToOne(() => Status, {
    eager: false,
  })
  @JoinColumn({ name: 'type_id' })
  type: Status;

  @Column({
    name: 'size_id',
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  sizeId: number;

  @ManyToOne(() => Status, {
    eager: false,
  })
  @JoinColumn({ name: 'size_id' })
  size: Status | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email?: string | null;

  @Column({
    name: 'phone_country_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  phoneCountryId?: number | null;

  @ManyToOne(() => Country, {
    nullable: true,
    eager: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'phone_country_id' })
  phoneCountry: Country | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phone?: string | null;

  @Column({
    name: 'facebook_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  facebookUrl?: string | null;

  @Column({
    name: 'linked_in_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  linkedinUrl?: string | null;

  @Column({
    name: 'youtube_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  youtubeUrl?: string | null;

  @Column({
    name: 'instagram_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  instagramUrl?: string | null;

  @Column({
    name: 'website_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  websiteUrl?: string | null;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address?: string | null;

  @Column({
    name: 'original_logo_media_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  originalLogoMediaId?: number | null;

  @OneToOne(() => Media, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'original_logo_media_id', referencedColumnName: 'id' })
  originalLogoMedia: Media | null;

  @Column({
    name: 'logo_media_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  logoMediaId?: number | null;

  @OneToOne(() => Media, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'logo_media_id', referencedColumnName: 'id' })
  logoMedia: Media | null;

  @Column({
    name: 'invoice_logo_media_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  invoiceLogoMediaId?: number | null;

  @OneToOne(() => Media, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'invoice_logo_media_id', referencedColumnName: 'id' })
  invoiceLogoMedia: Media | null;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  Creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToMany(() => AppUser, (appUser) => appUser.application)
  appUsers: AppUser[];

  // @OneToMany(() => Office, (office) => office.application)
  // offices: Office[];
}
