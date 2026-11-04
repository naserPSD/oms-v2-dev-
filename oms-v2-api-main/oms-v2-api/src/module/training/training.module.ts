import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { AppUser } from '@module/users/entities/app-user.entity';
import { UserTraining } from '@module/users/entities/user-training.entity';
import { UsersModule } from '@module/users/users.module';
import { Role } from '@module/role-permission/entities/role.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { AuthModule } from '@module/auth/auth.module';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTraining,
      Employee,
      AppUser,
      Role,
      UserRole,
    ]),
    AuthModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
