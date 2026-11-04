import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@module/auth/auth.module';
import { MediaModule } from '@module/media/media.module';
import { Media } from '@module/media/entities/media.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Income } from './entities/income.entity';
import { Expense } from './entities/expense.entity';
import { AccountCategory } from './entities/account-category.entity';
import { AppUser } from '@module/users/entities/app-user.entity';

// New Category Management
import { MasterIncomeCategory } from './entities/master-income-category.entity';
import { MasterExpenseCategory } from './entities/master-expense-category.entity';
import { UserIncomeCategory } from './entities/user-income-category.entity';
import { UserExpenseCategory } from './entities/user-expense-category.entity';
import { CategoryManagementController } from './category-management.controller';
import { CategoryManagementService } from './category-management.service';
import { Invoice } from '@module/subscription/entities/invoices.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Income, 
      Expense, 
      AccountCategory, 
      AppUser, 
      Media,
      MasterIncomeCategory,
      MasterExpenseCategory,
      UserIncomeCategory,
      UserExpenseCategory,
      Invoice
    ]),
    AuthModule,
    MediaModule,
  ],
  controllers: [AccountsController, CategoryManagementController],
  providers: [AccountsService, CategoryManagementService],
  exports: [AccountsService, CategoryManagementService],
})
export class AccountsModule {}