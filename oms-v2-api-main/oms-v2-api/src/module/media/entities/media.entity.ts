import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';

@Entity({ name: 'aws_media', synchronize: true })
export class Media {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app?: Application;

  @Column({
    name: 'model',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Entity Name',
  })
  model?: string | null;

  @Column({
    name: 'model_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: 'Entity Id',
  })
  modelId?: number | null;

  @Column({
    name: 'document_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  documentTypeId?: number | null;

  @Column({
    name: 'original_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  originalName?: string;

  @Column({
    name: 'filename',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  filename: string;

  @Column({
    name: 'size',
    type: 'double',
    precision: 24,
    scale: 2,
    nullable: true,
    comment: 'Size Unit Is Bytes',
  })
  size?: number;

  @Column({ name: 'extension', type: 'varchar', length: 255, nullable: true })
  extension?: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255, nullable: true })
  mimeType?: string;

  @Column({ name: 'folder_path', type: 'varchar', length: 255, nullable: true })
  folderPath?: string; // AWS folder path

  @Column({ nullable: true })
  awsKey: string; // AWS S3 key

  @Column({ name: 'note', type: 'varchar', length: 255, nullable: true })
  note?: string;

  @Column({ name: 'creator_id', type: 'int', unsigned: true, nullable: true })
  creatorId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  // Always return static local URL
  @Expose()
  get fileUrl(): string {
    if (!this.filename) return '';
    let assetsUrl =
      process.env.ASSETS_URL && process.env.ASSETS_URL !== 'undefined'
        ? process.env.ASSETS_URL
        : '';

    const isProduction =
      process.env.NODE_ENV === 'production' ||
      Boolean(
        process.env.FRONTEND_URL &&
          !process.env.FRONTEND_URL.includes('localhost'),
      );

    // In production environment, NEVER return localhost or 127.0.0.1 to clients
    if (
      isProduction &&
      (!assetsUrl ||
        assetsUrl.includes('localhost') ||
        assetsUrl.includes('127.0.0.1'))
    ) {
      assetsUrl = process.env.FRONTEND_URL || 'https://sanzio.app';
    } else if (!assetsUrl) {
      assetsUrl = `http://localhost:${process.env.PORT || 4000}`;
    }

    assetsUrl = assetsUrl.replace(/\/+$/, '').replace(/\/api$/, '');

    // Upgrade http://sanzio.app to https:// to prevent mixed-content blocks
    if (assetsUrl.includes('sanzio.app') && assetsUrl.startsWith('http://')) {
      assetsUrl = assetsUrl.replace('http://', 'https://');
    }

    const assetsDir =
      process.env.ASSETS_DIR && process.env.ASSETS_DIR !== 'undefined'
        ? `${process.env.ASSETS_DIR}/`
        : '';
    return `${assetsUrl}/api/static/${assetsDir}${this.filename}`;
  }
}
