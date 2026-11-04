import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('db_configs', { synchronize: true })
export class DbConfig {
  @Index('db_config_id')
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @Unique(['key'])
  @Column({ name: 'key', type: 'varchar', length: 50 })
  key: string;

  @Column({ name: 'value', type: 'varchar', length: 255 })
  value: string;

  @Column({ name: 'json_data', type: 'varchar', length: 255, nullable: true })
  jsonData: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date | null;
}
