import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_language_proficiencies')
export class UserLanguageProficiency {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: false })
  userId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'This id will come from countries table',
    name: 'language_id',
  })
  languageId: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'This id will come from statuses table group of proficiency level',
    name: 'speaking_level_id',
  })
  speakingLevelId: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'This id will come from statuses table group of proficiency level',
    name: 'reading_level_id',
  })
  readingLevelId: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'This id will come from statuses table group of proficiency level',
    name: 'writing_level_id',
  })
  writingLevelId: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @Expose()
  languageName: any;

  @Expose()
  speakingLevelName: any;

  @Expose()
  readingLevelName: any;

  @Expose()
  writingLevelName: any;
}
