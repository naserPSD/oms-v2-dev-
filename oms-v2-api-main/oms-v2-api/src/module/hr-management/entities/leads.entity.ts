import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { LeadGroups } from './lead-groups.entity';
import { LeadStage } from './lead-stages.entity';

@Entity('leads', { synchronize: false })
export class Leads {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
  })
  appId?: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({
    name: 'lead_group_id',
    type: 'int',
    unsigned: true,
  })
  leadGroupId: number;

  @ManyToOne(() => LeadGroups)
  @JoinColumn({ name: 'lead_group_id' })
  leadGroup?: LeadGroups;

  @Column({
    name: 'lead_stage_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  leadStageId?: number;

  @ManyToOne(() => LeadStage)
  @JoinColumn({ name: 'lead_stage_id' })
  leadStage?: LeadStage;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  firstName?: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  lastName?: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  company?: string;

  @Column({
    type: 'varchar',
    length: 128,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone?: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  website?: string;

  @Column({
    name: 'last_contacted_at',
    type: 'datetime',
    nullable: true,
  })
  lastContactedAt?: Date;

  @Column({
    name: 'next_followup_at',
    type: 'datetime',
    nullable: true,
  })
  nextFollowupAt?: Date;

  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  creatorId?: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    nullable: true,
  })
  deletedAt?: Date;
}
