import { Media } from '@module/media/entities/media.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_certifications')
export class UserCertification {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
  })
  name: string | null;

  @Column({
    name: 'issuing_organization',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  issuingOrganization: string | null;

  @Column({
    name: 'issue_date',
    type: 'date',
    nullable: true,
  })
  issueDate: Date | null;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: Date | null;

  @Column({ name: 'attachment_id', type: 'int', nullable: true })
  attachmentId: number | null;

  // Optional one-to-one relationship
  @ManyToOne(() => Media, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'attachment_id' })
  attachmentMedia: Media | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
