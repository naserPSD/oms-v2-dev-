import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  RelationId,
  Unique,
} from 'typeorm';
import { EmpAttendance } from './employee-attendance.entity';
import { OfficeShift } from './office-shift.entity';
import { Office } from './office.entity';
import { Designation } from '@module/application/entities/designations.entity';
import { User } from '@module/users/entities/user.entity';
import { Status } from '@module/status/entities/status.entity';
import { UserProfile } from '@module/users/entities/user-profile.entity';
import { Department } from '@module/application/entities/departments.entity';
import { Application } from '@module/application/entities/application.entity';
import { EmployeeHierarchy } from './employee-hierarchy.entity';
import { EmpSalaryGrade } from '../../payroll/entities/employee-salary-grades.entity';
import { EmpSalaryStructure } from '@module/payroll/entities/employee-salary-structure.entity';
import { JobInterviewer } from '@module/recruitment/entitities/job-interviewers.entity';

@Entity({ name: 'employees', synchronize: false })
@Index('UQ_EMPLOYEES_APP_CODE', ['appId', 'employeeCode'], { unique: true })
export class Employee {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'employee_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  employeeCode?: string | null;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @RelationId((employee: Employee) => employee.user)
  // userId: number | null;

  // @ManyToOne(() => UserProfile, { nullable: false })
  // @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  // userProfile: UserProfile;

  // ✅ Virtual getter, not a DB relation
  get userProfile(): UserProfile | null {
    return this.user?.profile ?? null;
  }

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'designation_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  designationId?: number | null;

  @ManyToOne(() => Designation, { nullable: true })
  @JoinColumn({ name: 'designation_id' })
  designation: Designation;

  @Column({
    name: 'office_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  officeId?: number | null;

  @ManyToOne(() => Office, { nullable: true })
  @JoinColumn({ name: 'office_id' })
  office: Office;

  @Column({
    name: 'office_shift_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  officeShiftId?: number | null;

  @ManyToOne(() => OfficeShift, { nullable: true })
  @JoinColumn({ name: 'office_shift_id' })
  officeShift: OfficeShift;

  @Column({
    name: 'employment_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  employmentStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'employment_status_id' })
  employmentStatus: Status;

  @Column({
    name: 'employee_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  employeeStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'employee_status_id' })
  employeeStatus: Status;

  @Column({
    name: 'current_grade_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  currentGradeId?: number | null;

  @ManyToOne(() => EmpSalaryGrade, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_grade_id' })
  currentGrade?: EmpSalaryGrade;

  @Column({
    name: 'current_basic_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  currentBasicSalary?: number | null;

  @Column({
    name: 'joining_date',
    type: 'timestamp',
    nullable: true,
  })
  joiningDate?: Date | null;

  @Column({
    name: 'remarks',
    type: 'text',
    nullable: true,
    comment: 'Optional remarks for the invoice',
  })
  remarks?: string | null;

  @Column({
    name: 'resignation_date',
    type: 'timestamp',
    nullable: true,
  })
  resignationDate?: Date | null;

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

  @OneToMany(() => EmpAttendance, (att) => att.employee)
  attendances: EmpAttendance[];

  @OneToMany(() => EmployeeHierarchy, (hierarchy) => hierarchy.supervisor)
  subordinates: EmployeeHierarchy[];

  @OneToMany(() => EmployeeHierarchy, (hierarchy) => hierarchy.employee)
  supervisors: EmployeeHierarchy[];

  @OneToMany(() => EmpSalaryStructure, (item) => item.employee)
  salaryStructures: EmpSalaryStructure[];

  @OneToMany(() => JobInterviewer, (interviewer) => interviewer.employee)
  jobInterviewers: JobInterviewer[];
}
