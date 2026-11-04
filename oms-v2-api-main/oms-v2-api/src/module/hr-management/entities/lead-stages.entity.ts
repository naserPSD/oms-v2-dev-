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

@Entity('lead_stages', { synchronize: false })
export class LeadStage {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Index('idx_lead_stages_app_id')
  @Column({
    type: 'int',
    unsigned: true,
    name: 'app_id',
  })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Index('idx_lead_stages_group_id')
  @Column({
    type: 'int',
    unsigned: true,
    name: 'lead_group_id',
  })
  leadGroupId: number;

  @Column({
    unsigned: true,
    type: 'varchar',
    length: 50,
    //name: 'name',
  })
  name: string;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'serial',
  })
  serial: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;
}
