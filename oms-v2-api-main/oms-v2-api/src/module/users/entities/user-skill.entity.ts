import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum SkillLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
}

@Entity('user_skills')
export class UserSkill {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  userId: number | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'skill_name',
    type: 'varchar',
    length: 124,
    nullable: true,
  })
  skillName: string | null;

  @Column({
    name: 'skill_level',
    type: 'enum',
    enum: SkillLevel,
    enumName: 'skill_level_enum',
    nullable: true,
  })
  skillLevel: SkillLevel | null;

  @Column({
    name: 'years_of_experience',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  yearsOfExperience: number | null;

  @Column({
    name: 'is_technical',
    type: 'tinyint',
    width: 1,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
  })
  isTechnical: boolean;
}
