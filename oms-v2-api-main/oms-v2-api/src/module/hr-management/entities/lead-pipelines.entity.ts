import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadGroups } from './lead-groups.entity';

@Entity('lead_pipelines', { synchronize: false })
export class LeadPipeline {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_lead_pipelines_app_id')
  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
  })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Index('idx_lead_pipelines_lead_group_id')
  @Column({
    name: 'lead_group_id',
    type: 'int',
    unsigned: true,
  })
  leadGroupId: number;

  @ManyToOne(() => LeadGroups, { nullable: false })
  @JoinColumn({ name: 'lead_group_id' })
  leadGroup: LeadGroups;

  @Index('idx_lead_pipelines_prev_stage_id')
  @Column({
    name: 'prev_stage_id',
    type: 'int',
    unsigned: true,
  })
  prevStageId: number;

  @Index('idx_lead_pipelines_current_stage_id')
  @Column({
    name: 'current_statge_id',
    type: 'int',
    unsigned: true,
  })
  currentStageId: number;

  @Column({
    name: 'days_in_stage',
    type: 'int',
    unsigned: true,
  })
  daysInStage: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;
}
