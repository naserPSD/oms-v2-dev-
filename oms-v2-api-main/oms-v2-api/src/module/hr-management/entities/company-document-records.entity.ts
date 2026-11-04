import { Application } from '@module/application/entities/application.entity';
import { Media } from '@module/media/entities/media.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CompanyDocument } from './company-documents.entity';

@Entity({ name: 'company_document_records', synchronize: false })
export class CompanyDocumentRecords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId: number;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'company_document_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  companyDocumentId: number;

  @ManyToOne(() => CompanyDocument, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_document_id' })
  companyDocument: CompanyDocument;

  @Column({
    name: 'entity',
    type: 'varchar',
    length: 255,
  })
  entity: string;

  @Column({
    name: 'entity_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  entityId: number;

  @Column({
    name: 'media_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  mediaId: number;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
