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
} from 'typeorm';

@Entity({ name: 'master_documents', synchronize: false })
export class MasterDocument {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'document_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  documentName: string;

  @Column({
    name: 'document_type_id',
    unsigned: true,
    type: 'int',
    nullable: true,
  })
  documentTypeId: number;

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

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
