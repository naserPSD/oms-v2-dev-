import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { CategoryManagementService } from './category-management.service';
import { CreateMasterCategoryDto, UpdateMasterCategoryDto, CreateUserCategoryDto, UpdateUserCategoryDto } from './dto/category-management.dto';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Permissions } from '@core/guards/permissions.decorator';

@Controller('api/v1/accounts/categories')
@UseGuards(JwtAuthGuard)
export class CategoryManagementController {
  constructor(private readonly categoryService: CategoryManagementService) {}

  // ================= MASTER INCOME =================
  @Get('master/income')
  getMasterIncome() { return this.categoryService.getMasterIncomeCategories(); }

  @Post('master/income')
  @Permissions("master.category.manage")
  createMasterIncome(@Body() dto: CreateMasterCategoryDto) { return this.categoryService.createMasterIncome(dto); }

  @Patch('master/income/:id')
  @Permissions("master.category.manage")
  updateMasterIncome(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMasterCategoryDto) { return this.categoryService.updateMasterIncome(id, dto); }

  @Delete('master/income/:id')
  @Permissions("master.category.manage")
  deleteMasterIncome(@Param('id', ParseIntPipe) id: number) { return this.categoryService.deleteMasterIncome(id); }

  // ================= MASTER EXPENSE =================
  @Get('master/expense')
  getMasterExpense() { return this.categoryService.getMasterExpenseCategories(); }

  @Post('master/expense')
  @Permissions("master.category.manage")
  createMasterExpense(@Body() dto: CreateMasterCategoryDto) { return this.categoryService.createMasterExpense(dto); }

  @Patch('master/expense/:id')
  @Permissions("master.category.manage")
  updateMasterExpense(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMasterCategoryDto) { return this.categoryService.updateMasterExpense(id, dto); }

  @Delete('master/expense/:id')
  @Permissions("master.category.manage")
  deleteMasterExpense(@Param('id', ParseIntPipe) id: number) { return this.categoryService.deleteMasterExpense(id); }

  // ================= USER INCOME =================
  @Get('user/income')
  getUserIncome() { return this.categoryService.getUserIncomeCategories(); }

  @Post('user/income')
  async createUserIncome(@Body() dto: CreateUserCategoryDto) {
    const result = await this.categoryService.createUserIncome(dto);
    return { message: 'Income category created successfully', data: result };
  }

  @Patch('user/income/:id')
  async updateUserIncome(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserCategoryDto) { 
    const result = await this.categoryService.updateUserIncome(id, dto); 
    return { message: 'Income category updated successfully', data: result };
  }

  @Delete('user/income/:id')
  async deleteUserIncome(@Param('id', ParseIntPipe) id: number) { 
    await this.categoryService.deleteUserIncome(id); 
    return { message: 'Income category deleted successfully' };
  }

  // ================= USER EXPENSE =================
  @Get('user/expense')
  getUserExpense() { return this.categoryService.getUserExpenseCategories(); }

  @Post('user/expense')
  async createUserExpense(@Body() dto: CreateUserCategoryDto) { 
    const result = await this.categoryService.createUserExpense(dto); 
    return { message: 'Expense category created successfully', data: result };
  }

  @Patch('user/expense/:id')
  async updateUserExpense(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserCategoryDto) { 
    const result = await this.categoryService.updateUserExpense(id, dto); 
    return { message: 'Expense category updated successfully', data: result };
  }

  @Delete('user/expense/:id')
  async deleteUserExpense(@Param('id', ParseIntPipe) id: number) { 
    await this.categoryService.deleteUserExpense(id); 
    return { message: 'Expense category deleted successfully' };
  }

  // ================= IMPORT =================
  @Post('master/import')
  @Permissions("master.category.manage")
  importMasterCategories() {
    return this.categoryService.importMasterCategories();
  }

  // ================= COMBINED (API Requirement 3) =================
  @Get('combined/income')
  getCombinedIncome(@Query('status') status: string) { return this.categoryService.getCombinedIncomeCategories(status); }

  @Get('combined/expense')
  getCombinedExpense(@Query('status') status: string) { return this.categoryService.getCombinedExpenseCategories(status); }
}
