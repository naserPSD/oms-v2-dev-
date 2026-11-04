import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadManagementService } from './lead-management.service';
import { LeadManagementController } from './lead-management.controller';
import { Lead, LeadSchema } from './schemas/lead.schema';
import {
  LeadActivity,
  LeadActivitySchema,
} from './schemas/lead-activity.schema';
import {
  Communication,
  CommunicationSchema,
} from './schemas/communication.schema';
import { AuthModule } from '@module/auth/auth.module';
import { Application } from '@module/application/entities/application.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { Role } from '@module/role-permission/entities/role.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: LeadActivity.name, schema: LeadActivitySchema },
      { name: Communication.name, schema: CommunicationSchema },
    ]),
    TypeOrmModule.forFeature([Application, UserRole, Role, Employee]),
    AuthModule,
  ],
  controllers: [LeadManagementController],
  providers: [LeadManagementService],
  exports: [LeadManagementService],
})
export class LeadManagementModule {}
