import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Permissions } from '@core/guards/permissions.decorator';
import { AccountsService } from './accounts.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto, ExportExpenseQueryDto } from './dto/expense-query.dto';
import { ExpenseSummaryQueryDto } from './dto/expense-summary-query.dto';
import { BulkDeleteExpensesDto, BulkStatusUpdateExpensesDto } from './dto/bulk-expense.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DashboardReportQueryDto } from './dto/dashboard-report-query.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('Accounts')
@ApiBearerAuth('access_token')
@Controller('api/v1/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics for accounts' })
  async getDashboardStats() {
    const stats = await this.accountsService.getDashboardStats();
    return {
      message: 'Accounts stats fetched successfully',
      data: stats,
    };
  }

  @Get('reports/dashboard')
  @Permissions('accounts.expense.view') // Assuming basic view permission is enough
  @ApiOperation({ summary: 'Get detailed reports dashboard data' })
  async getReportsDashboard(@Query() query: DashboardReportQueryDto) {
    const data = await this.accountsService.getReportsDashboard(query);
    return {
      success: true,
      data,
    };
  }

  // ==================== INCOME ENDPOINTS ====================

  @Post('incomes')
  @Permissions('accounts.income.create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Create new income record (with optional file attachment)' })
  createIncome(
    @Body() dto: CreateIncomeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.accountsService.createIncome(dto, file);
  }

  @Get('incomes')
  @Permissions('accounts.income.view')
  @ApiOperation({ summary: 'Get list of income records with filters' })
  findAllIncomes(@Query() query: IncomeQueryDto) {
    return this.accountsService.findAllIncomes(query);
  }

  @Get('incomes/:id')
  @Permissions('accounts.income.view')
  @ApiOperation({ summary: 'Get details of single income record' })
  findOneIncome(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOneIncome(id);
  }

  @Patch('incomes/:id')
  @Permissions('accounts.income.update')
  @ApiOperation({ summary: 'Update income record' })
  updateIncome(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeDto) {
    return this.accountsService.updateIncome(id, dto);
  }

  @Delete('incomes/:id')
  @Permissions('accounts.income.delete')
  @ApiOperation({ summary: 'Delete income record' })
  async removeIncome(@Param('id', ParseIntPipe) id: number) {
    await this.accountsService.removeIncome(id);
    return { message: 'Income deleted successfully' };
  }

  // ==================== EXPENSE CATEGORY ENDPOINTS ====================

  @Get('expense-categories')
  @Permissions('accounts.expense.view')
  @ApiOperation({ summary: 'Get active expense categories for dropdown' })
  findAllCategories() {
    return this.accountsService.findAllCategories();
  }

  @Post('expense-categories')
  @Permissions('accounts.category.create')
  @ApiOperation({ summary: 'Create new expense category' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.accountsService.createCategory(dto);
  }

  @Patch('expense-categories/:id')
  @Permissions('accounts.category.update')
  @ApiOperation({ summary: 'Update expense category' })
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    const updatedCategory = await this.accountsService.updateCategory(id, dto);
    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  @Delete('expense-categories/:id')
  @Permissions('accounts.category.delete')
  @ApiOperation({ summary: 'Delete expense category' })
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    await this.accountsService.removeCategory(id);
    return { message: 'Category deleted successfully' };
  }

  // ==================== EXPENSE SUMMARY & EXPORT ENDPOINTS ====================

  @Get('expenses/summary')
  @Permissions('accounts.expense.view')
  @ApiOperation({ summary: 'Get expense summary analytics for dashboard cards' })
  getExpenseSummary(@Query() query: ExpenseSummaryQueryDto) {
    return this.accountsService.getExpenseSummary(query);
  }

  @Get('expenses/export')
  @Permissions('accounts.expense.view')
  @ApiOperation({ summary: 'Export expense list in CSV or Excel format' })
  async exportExpenses(@Query() query: ExportExpenseQueryDto, @Res() res: Response) {
    const csvData = await this.accountsService.exportExpensesCsv(query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="expense-report.csv"');
    return res.send(csvData);
  }

  // ==================== BULK EXPENSE ENDPOINTS ====================

  @Post('expenses/bulk-delete')
  @Permissions('accounts.expense.delete')
  @ApiOperation({ summary: 'Bulk delete expense records' })
  async bulkDeleteExpenses(@Body() dto: BulkDeleteExpensesDto) {
    const result = await this.accountsService.bulkDeleteExpenses(dto.ids);
    return { message: `${result.count} expenses deleted successfully`, count: result.count };
  }

  @Patch('expenses/bulk-status-update')
  @Permissions('accounts.expense.update')
  @ApiOperation({ summary: 'Bulk update expense status' })
  async bulkStatusUpdateExpenses(@Body() dto: BulkStatusUpdateExpensesDto) {
    const result = await this.accountsService.bulkStatusUpdateExpenses(dto.ids, dto.status);
    return { message: `${result.count} expenses updated to ${dto.status}`, count: result.count };
  }

  // ==================== CORE EXPENSE CRUD ENDPOINTS ====================

  @Post('expenses')
  @Permissions('accounts.expense.create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Create new expense record (with optional file attachment)' })
  createExpense(
    @Body() dto: CreateExpenseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.accountsService.createExpense(dto, file);
  }

  @Get('expenses')
  @Permissions('accounts.expense.view')
  @ApiOperation({ summary: 'Get expense list with filtering and pagination' })
  findAllExpenses(@Query() query: ExpenseQueryDto) {
    return this.accountsService.findAllExpenses(query);
  }

  @Get('expenses/:id')
  @Permissions('accounts.expense.view')
  @ApiOperation({ summary: 'Get details of single expense record' })
  findOneExpense(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOneExpense(id);
  }

  @Patch('expenses/:id')
  @Permissions('accounts.expense.update')
  @ApiOperation({ summary: 'Update expense record' })
  updateExpense(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseDto) {
    return this.accountsService.updateExpense(id, dto);
  }

  @Delete('expenses/:id')
  @Permissions('accounts.expense.delete')
  @ApiOperation({ summary: 'Delete expense record' })
  async removeExpense(@Param('id', ParseIntPipe) id: number) {
    await this.accountsService.removeExpense(id);
    return { message: 'Expense deleted successfully' };
  }

  // ==================== EXPENSE ATTACHMENTS & VOUCHER ENDPOINTS ====================

  @Get('expenses/:id/voucher-pdf')
  @Permissions('accounts.expense.view')
  @ApiOperation({ summary: 'Generate and download payment voucher PDF for expense' })
  async getPaymentVoucherPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const pdfBuffer = await this.accountsService.generatePaymentVoucherPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payment-voucher-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    return res.end(pdfBuffer);
  }

  @Post('expenses/:id/attachments')
  @Permissions('accounts.expense.update')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload receipt/voucher attachment file for expense' })
  uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.accountsService.addExpenseAttachment(id, file);
  }

  @Get('expenses/:id/attachments/:fileId')
  @Permissions('accounts.expense.view')
  @ApiOperation({ summary: 'Download/view attached receipt file' })
  async getAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
  ) {
    const media = await this.accountsService.getExpenseAttachment(id, fileId);
    const localDir = path.join(process.cwd(), 'static', process.env.ASSETS_DIR || '');
    const filePath = path.join(localDir, media.filename);

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.redirect(media.fileUrl);
  }

  @Delete('expenses/:id/attachments/:fileId')
  @Permissions('accounts.expense.update')
  @ApiOperation({ summary: 'Delete attached receipt file' })
  async removeAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ) {
    await this.accountsService.removeExpenseAttachment(id, fileId);
    return { message: 'Attachment deleted successfully' };
  }
}