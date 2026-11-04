import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BatchEmail } from './batch-emails.entity';

@Entity({ name: 'batch_email_sections', synchronize: false })
export class BatchEmailSection {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'batch_email_id',
    type: 'int',
    unsigned: true,
  })
  batchEmailId: number;

  @ManyToOne(() => BatchEmail, { eager: false })
  @JoinColumn({ name: 'batch_email_id' })
  batchEmail: BatchEmail;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title?: string | null;

  @Column({
    name: 'img_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  imgId?: number | null;

  @Column({
    name: 'btn_text',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  btnText?: string | null;

  @Column({
    name: 'btn_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  btnUrl?: string | null;

  @Column({
    name: 'body_text',
    type: 'text',
    nullable: true,
  })
  bodyText?: string | null;

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
