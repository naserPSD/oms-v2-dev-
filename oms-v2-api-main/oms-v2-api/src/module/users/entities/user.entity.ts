//src/module/users/entities/user.entity.ts
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { UserWorkExperience } from './user-work-experience.entity';
import { UserEducation } from './user-education.entity';
import { UserSkill } from './user-skill.entity';
import { UserCertification } from './user-certification.entity';
import { UserProject } from './user-project.entity';
import { UserTraining } from './user-training.entity';
import { UserReference } from './user-reference.entity';
import { Country } from '@module/country/entities/country.entity';
import { UserPermission } from '@module/role-permission/entities/user-permission.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { AppUser } from './app-user.entity';
import { UserLanguageProficiency } from './user-language-proficiency.entity';
import { UserContactInfo } from './user-contact-info.entity';
import { Application } from '@module/application/entities/application.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';

export enum UseCase {
  ADMIN = 'Admin',
  PERSONAL = 'Personal',
  COMPANY = 'Company',
  SUBSCRIBER = 'Subscriber',
}

@Entity({ name: 'users', synchronize: true })
export class User {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Index()
  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName: string;

  @Index()
  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName: string;

  @Index('UNIQUE_USER_EMAIL', { unique: true })
  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'email_verified_at', type: 'datetime', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    name: 'reset_first_password',
    type: 'tinyint',
    nullable: false,
    default: 0,
    transformer: {
      from: (value: number) => value === 1,
      to: (value: boolean) => (value ? 1 : 0),
    },
  })
  resetFirstPassword: boolean = false;

  @Column({
    name: 'invitation_count',
    type: 'tinyint',
    nullable: false,
    unsigned: true,
    default: 0,
  })
  invitationCount: number = 0;

  @Column({ name: 'remember_token', type: 'varchar', nullable: true })
  rememberToken: string;

  @Column({
    name: 'last_timezone',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  lastTimezone: string | null;

  @Column({
    name: 'last_session_id',
    type: 'int',
    nullable: true,
    unsigned: true,
  })
  lastSessionId: number;

  @Column({
    name: 'app_use_case',
    default: null,
    type: 'enum',
    enum: UseCase,
  })
  appUseCase: UseCase;

  @Column({
    name: 'profile_completed',
    default: 0,
    type: 'tinyint',
    transformer: {
      from: (value: number) => value === 1,
      to: (value: boolean) => (value ? 1 : 0),
    },
    nullable: true,
  })
  profileCompleted: boolean | null;

  @Column({
    name: 'active_app_id',
    type: 'int',
    nullable: true,
    unsigned: true,
  })
  activeAppId: number;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'active_app_id' })
  activeApp: Application;

  @Index('idx_user_is_active')
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: 1,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    // eager: true,
    cascade: true, // optional
    nullable: true,
  })
  profile: UserProfile | null;

  // @OneToOne(() => UserProfile, (profile) => profile.user, {
  //   createForeignKeyConstraints: false,
  //   eager: true,
  //   nullable: true,
  // })
  // // @JoinColumn({ name: 'id', referencedColumnName: 'userId' }) // Must match exactly the property name in UserProfile
  // // profile: Promise<UserProfile> | UserProfile | null;

  /** Company membership rows; removed when application is deleted (FK cascade). */
  @OneToMany(() => AppUser, (appUser) => appUser.user)
  appUsers: AppUser[];

  // Optional one-to-one relationship
  // @OneToOne(() => UserProfile, (profile) => profile.user, {
  //   createForeignKeyConstraints: false,
  //   eager: true,
  //   nullable: true,
  // })
  // @JoinColumn({ name: 'id', referencedColumnName: 'userId' }) // Must match exactly the property name in UserProfile
  // profile: Promise<UserProfile> | UserProfile | null;

  set fullName(name: string) {
    const [firstName, lastName] = name.split(' ');
    this.firstName = firstName;
    this.lastName = lastName;
  }

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  // @OneToMany(() => UserRole, (userRole) => userRole.roleId)
  // roleIds: number[];

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  userPermissions: UserPermission[];

  // Helper method to get all permissions
  async getAllPermissions(): Promise<string[]> {
    // This would be implemented in the service
    return [];
  }

  @Expose()
  languageProficiencies: any;

  @Expose()
  userContactInfo: any;

  @OneToMany(() => UserContactInfo, (contactInfo) => contactInfo.user, {
    eager: true,
  })
  userContactInfos: UserContactInfo[];

  @OneToMany(
    () => UserLanguageProficiency,
    (languageProficiency) => languageProficiency.user,
    { eager: true },
  )
  userLanguageProficiencies: UserLanguageProficiency[];

  @OneToMany(() => UserSkill, (skill) => skill.user, { eager: true })
  userSkills: UserSkill[];

  @OneToMany(() => UserCertification, (certification) => certification.user, {
    eager: true,
  })
  userCertifications: UserCertification[];

  @OneToMany(
    () => UserWorkExperience,
    (workExperience) => workExperience.user,
    { eager: true },
  )
  UserWorkExperiences: UserWorkExperience[];

  @Expose()
  userWorkExperiences:
    | UserWorkExperience[]
    | Promise<UserWorkExperience[]>
    | null;

  @Expose()
  educations: UserEducation[] | Promise<UserEducation[]> | null;

  @OneToMany(() => UserEducation, (education) => education.user, {
    eager: true,
  })
  userEducations: UserEducation[];

  @Expose()
  skills: UserSkill[] | Promise<UserSkill[]> | null;

  @Expose()
  certifications: UserCertification[] | Promise<UserCertification[]> | null;

  @Expose()
  projects: UserProject[] | Promise<UserProject[]> | null;

  @Expose()
  trainings: UserTraining[] | Promise<UserTraining[]> | null;

  @OneToMany(() => UserTraining, (training) => training.user, { eager: true })
  userTrainings: UserTraining[];

  @OneToMany(() => UserProject, (project) => project.user, { eager: true })
  userProjects: UserProject[];

  @OneToMany(() => UserReference, (reference) => reference.user, {
    eager: true,
  })
  userReferences: UserReference[];

  @Expose()
  references: UserReference[] | Promise<UserReference[]> | null;

  @OneToMany(() => Employee, (employee) => employee.user)
  employees: Employee[];

  @OneToOne(() => Employee, (employee) => employee.user)
  employee: Employee;
}
