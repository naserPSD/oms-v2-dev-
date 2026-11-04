import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinTable,
  Index,
  JoinColumn,
} from 'typeorm';
import { JoinAttribute } from 'typeorm/query-builder/JoinAttribute';

@Entity({ name: 'sender_emails', synchronize: false })
export class SenderEmail {
  @PrimaryGeneratedColumn({
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
  appId?: number | null;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  name?: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email?: string | null;

  @Column({
    name: 'is_primary',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  isPrimary: boolean;

  @Column({
    name: 'is_verfied',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  isVerified: boolean;

  @Column({
    name: 'verfied_by',
    type: 'int',
    nullable: true,
  })
  verifiedBy?: number | null;

  @Column({
    name: 'verfied_at',
    type: 'datetime',
    nullable: true,
  })
  verifiedAt?: Date | null;

  @Index('idx_sender_emails_signature_id')
  @Column({
    name: 'signature_id',
    type: 'varchar',
    length: 125,
    nullable: true,
  })
  signatureId?: string | null;

  @Column({
    name: 'purpose',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  purpose?: string | null;

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
  updatedAt?: Date | null;
}
