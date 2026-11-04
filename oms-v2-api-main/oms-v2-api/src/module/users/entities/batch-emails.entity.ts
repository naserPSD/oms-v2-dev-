import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'batch_emails', synchronize: false })
export class BatchEmail {
  @PrimaryGeneratedColumn({
    name: 'id',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId: number | null;

  @ManyToOne(() => Application, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'campaign_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  campaignName: string | null;

  @Column({
    name: 'subject',
    type: 'varchar',
    length: 255,
  })
  subject: string;

  @Column({
    name: 'reply_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  replyEmail: string | null;

  @Column({
    name: 'filter_query',
    type: 'json',
    nullable: true,
  })
  filterQuery: any | null;

  @Column({
    name: 'template_design',
    type: 'json',
    nullable: true,
  })
  templateDesign: any | null;

  @Column({
    name: 'template_html',
    type: 'text',
    nullable: true,
  })
  templateHtml: string | null;

  @Column({
    name: 'sent_at',
    type: 'datetime',
    nullable: true,
  })
  sentAt: Date | null;

  @Column({
    name: 'total_recipients',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  totalRecipients: number;

  @Column({
    name: 'creator_id',
    unsigned: true,
    nullable: true,
  })
  creatorId: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({
    name: 'editor_id',
    unsigned: true,
    nullable: true,
  })
  editorId: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'editor_id' })
  editor: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;
}
