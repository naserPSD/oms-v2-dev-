import { Country } from '@module/country/entities/country.entity';
import { Exclude, Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  Index,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Index('IDX_USER_REFERENCES_USER_ID', ['userId'])
@Entity({ name: 'user_references', synchronize: true })
export class UserReference {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
  })
  userId: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'designation',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  designation: string | null;

  @Column({
    name: 'organization',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  organization: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'relation',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  relation: string | null;

  @Column({
    name: 'phone_country_id',
    type: 'int',
    nullable: true,
  })
  phoneCountryId: number | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  phone: string | null;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

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
}
