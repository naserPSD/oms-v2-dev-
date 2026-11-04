import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';

export type EmailTemplateScope = 'master' | 'company';
export type EmailTemplateStatus = 'active' | 'inactive' | 'draft';

@Entity({ name: 'email_templates', synchronize: false })
export class EmailTemplate {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId: number | null;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({ type: 'enum', enum: ['master', 'company'], default: 'company' })
  scope: EmailTemplateScope;

  @Column({
    name: 'available_for_subscriber',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  availableForSubscriber: boolean;

  @Column({
    name: 'source_template_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  sourceTemplateId: number | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'draft'],
    default: 'active',
  })
  status: EmailTemplateStatus;

  @Column({ name: 'is_default', type: 'tinyint', width: 1, default: 0 })
  isDefault: boolean;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'json', nullable: true })
  variables: string[] | null;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
