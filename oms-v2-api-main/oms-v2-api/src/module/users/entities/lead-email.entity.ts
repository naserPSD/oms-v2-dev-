import { Leads } from '@module/hr-management/entities/leads.entity';
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

@Entity({ name: 'lead_emails', synchronize: false })
export class LeadEmail {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({
    name: 'lead_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  leadId?: number | null;

  @ManyToOne(() => Leads, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead?: Leads;

  @Column({
    name: 'invoicing',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  invoicing: boolean;

  @Column({
    name: 'administrative',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  administrative: boolean;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  email?: string | null;

  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  creatorId?: number | null;

  @Column({
    name: 'editor_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  editorId?: number | null;

  @CreateDateColumn({
    name: 'created_at',
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
  updatedAt?: Date | null;
}
