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
import { Application } from '@module/application/entities/application.entity';

@Entity('company_asset_types')
@Index(['appId', 'name'], { unique: true })
export class CompanyAssetType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'created_by', type: 'int', unsigned: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
