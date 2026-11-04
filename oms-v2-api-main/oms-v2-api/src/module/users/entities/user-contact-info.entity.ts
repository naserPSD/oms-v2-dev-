import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_contact_infos', { synchronize: false })
export class UserContactInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unsigned: true, type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'mobile_personal',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  mobilePersonal: string | null;

  @Column({ name: 'mobile_work', type: 'varchar', length: 50, nullable: true })
  mobileWork: string | null;

  @Column({ name: 'telephone', type: 'varchar', length: 50, nullable: true })
  telephone: string | null;

  @Index('idx_user_contact_info_email_personal')
  @Column({
    name: 'email_personal',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  emailPersonal: string | null;

  @Index('idx_user_contact_info_email_official')
  @Column({
    name: 'email_official',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  emailOfficial: string | null;

  @Column({
    name: 'emergency_contact_person',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  emergencyContactPerson: string | null;

  @Column({
    name: 'emergency_contact_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  emergencyContactNumber: string | null;

  @Column({
    name: 'present_address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  presentAddress: string | null;

  @Column({
    name: 'permanent_address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  permanentAddress: string | null;

  @Column({ name: 'created_at', type: 'varchar', length: 255, nullable: true })
  createdAt: string | null;

  @Column({ name: 'updated_at', type: 'varchar', length: 255, nullable: true })
  updatedAt: string | null;
}
