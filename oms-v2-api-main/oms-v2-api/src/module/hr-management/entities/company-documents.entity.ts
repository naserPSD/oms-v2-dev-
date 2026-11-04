import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CompanyDocumentRecords } from './company-document-records.entity';

@Entity({ name: 'company_documents', synchronize: false })
export class CompanyDocument {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'document_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  documentName?: string | null;

  @Column({
    name: 'issue_date',
    type: 'date',
    nullable: true,
  })
  issueDate?: Date | null;

  @Column({
    name: 'expired_date',
    type: 'date',
    nullable: true,
  })
  expiredDate?: Date | null;

  @Column({
    name: 'document_type_id',
    unsigned: true,
    type: 'tinyint',
    nullable: true,
  })
  documentTypeId?: number | null;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'document_type_id' })
  documentType: Status;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    nullable: true,
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
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date | null;

  @OneToMany(() => CompanyDocumentRecords, (record) => record.companyDocument)
  documentRecords: CompanyDocumentRecords[];
}
