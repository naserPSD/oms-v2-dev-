import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskWorkspace } from './entities/task-workspace.entity';
import { AuthModule } from '@module/auth/auth.module';
import { TaskBoard } from './entities/task-boards.entity';
import { Status } from '@module/status/entities/status.entity';
import { TaskCard } from './entities/task-cards.entity';
import { Task } from './entities/task.entity';
import { TaskComment } from './entities/task-comments.entity';
import { TaskTag } from './entities/task-tags.entity';
import { TaskAssignee } from './entities/task-assignees.entity';
import { AppUser } from '@module/users/entities/app-user.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskWorkspace,
      TaskBoard,
      Status,
      TaskCard,
      Task,
      TaskComment,
      TaskTag,
      TaskAssignee,
      AppUser,
      Employee,
    ]),
    AuthModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
