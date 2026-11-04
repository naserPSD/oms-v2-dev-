import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { EmpPayrollRun } from './entities/employee-payroll-runs.entity';
import { Status } from '@module/status/entities/status.entity';
import { AppUser } from '@module/users/entities/app-user.entity';

// Import modules that provide these services
import { UsersModule } from '@module/users/users.module'; // provides UserContextService
import { AuthModule } from '@module/auth/auth.module';
import { AddressModule } from '@module/address/address.module';
import { MailModule } from 'src/mail/mail.module';
import { HybridQueueModule } from 'src/queue/hybrid-queue.module';
import { EmpSalaryGrade } from './entities/employee-salary-grades.entity';
import { EmpPromotion } from './entities/employee-promotions.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { Designation } from '@module/application/entities/designations.entity';
import { EmpPayItem } from './entities/employee-pay-items.entity';
import { EmpSalaryGradeRule } from './entities/employee-salary-grade-rules.entity';
import { EmpSalaryStructure } from './entities/employee-salary-structure.entity';
import { EmpSalaryStructureDetails } from './entities/employee-salary-structure-details.entity';

import { EmpPaymentHistory } from './entities/employee-payment-history.entity';
import { EmpSalaryHistory } from './entities/emp-salary-history.entity';
import { EmpPayrollMonthlyRecords } from './entities/employee-payroll-monthly-records.entity';
import { EmpPayrollMonthlyBreakdown } from './entities/emp-payroll-monthly-breakdowns.entity';
import { EmpAttendancePenalty } from '@module/hr-management/entities/emp-attendance-penalties.entity';
//import { CoreModule } from '@core/core.module'; // provides HelperService & RequestContext

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmpPayrollRun,
      Status,
      AppUser,
      EmpSalaryGrade,
      EmpPromotion,
      Employee,
      Designation,
      EmpPayItem,
      EmpSalaryGradeRule,
      EmpSalaryStructure,
      EmpSalaryHistory,
      EmpSalaryStructureDetails,
      EmpPaymentHistory,
      EmpPayrollMonthlyRecords,
      EmpPayrollMonthlyBreakdown,
      EmpAttendancePenalty,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AddressModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MailModule),
    HybridQueueModule,
  ],
  providers: [PayrollService],
  controllers: [PayrollController],
})
export class PayrollModule {}
