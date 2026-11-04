import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { RequestContext } from '@common/request-context';
import { AppUser } from '@module/users/entities/app-user.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { Media } from '@module/media/entities/media.entity';
import { MediaService } from '@module/media/media.service';
import { Income, IncomeStatus } from './entities/income.entity';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { AccountCategory, CategoryType } from './entities/account-category.entity';
import { CategoryManagementService } from './category-management.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto, ExportExpenseQueryDto } from './dto/expense-query.dto';
import { ExpenseSummaryQueryDto } from './dto/expense-summary-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DashboardReportQueryDto } from './dto/dashboard-report-query.dto';
import { Invoice } from '@module/subscription/entities/invoices.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(AccountCategory)
    private readonly categoryRepository: Repository<AccountCategory>,
    @InjectRepository(AppUser)
    private readonly appUserRepository: Repository<AppUser>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly mediaService: MediaService,
    private readonly categoryManagementService: CategoryManagementService,
  ) {}

  private formatAmount(amount: number): string {
    if (!amount) return '0';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return amount.toString();
  }

  // ==================== Dashbord API ====================
  async getDashboardStats() {
    let { appId } = this.context();
    // context() already requires a valid activeAppId — do not fall back to another company
    appId = Number(appId);

    // Due Invoices (from Invoice table)
    const dueInvoices = await this.invoiceRepository.createQueryBuilder('inv')
      .select('COUNT(inv.id)', 'count')
      .addSelect('SUM(inv.totalAmount)', 'total')
      .where('inv.appId = :appId', { appId })
      .andWhere('inv.paymentStatus = :paymentStatus', { paymentStatus: 'unpaid' })
      .andWhere('inv.status != :invStatus', { invStatus: 'cancelled' })
      .getRawOne();

    // Collected Incomes (from Income table)
    const collectedIncomes = await this.incomeRepository.createQueryBuilder('inc')
      .select('COUNT(inc.id)', 'count')
      .addSelect('SUM(inc.amount)', 'total')
      .where('inc.appId = :appId', { appId })
      .andWhere('inc.status = :status', { status: IncomeStatus.RECEIVED })
      .getRawOne();

    // Date calculations
    const now = new Date();
    
    // Current month boundaries (local time, simple approach)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Previous month boundaries
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const currentMonthExp = await this.expenseRepository.createQueryBuilder('exp')
      .select('SUM(exp.amount)', 'total')
      .where('exp.appId = :appId', { appId })
      .andWhere('exp.expenseDate >= :start', { start: currentMonthStart })
      .andWhere('exp.expenseDate <= :end', { end: currentMonthEnd })
      .getRawOne();

    const previousMonthExp = await this.expenseRepository.createQueryBuilder('exp')
      .select('SUM(exp.amount)', 'total')
      .where('exp.appId = :appId', { appId })
      .andWhere('exp.expenseDate >= :start', { start: previousMonthStart })
      .andWhere('exp.expenseDate <= :end', { end: previousMonthEnd })
      .getRawOne();

    const currentExpTotal = Number(currentMonthExp?.total || 0);
    const prevExpTotal = Number(previousMonthExp?.total || 0);
    let trend = 'same';
    if (currentExpTotal > prevExpTotal) trend = 'up';
    if (currentExpTotal < prevExpTotal) trend = 'down';

    return {
      dueInvoice: {
        total: Number(dueInvoices?.count || 0),
        amount: this.formatAmount(Number(dueInvoices?.total || 0)),
      },
      collected: {
        totalBill: Number(collectedIncomes?.count || 0),
        amount: this.formatAmount(Number(collectedIncomes?.total || 0)),
      },
      expenses: {
        currentMonth: this.formatAmount(currentExpTotal),
        trend,
        previousMonth: this.formatAmount(prevExpTotal),
      }
    };
  }

  async getReportsDashboard(query: DashboardReportQueryDto = {}) {
    let { appId } = this.context();
    appId = Number(appId);

    const { startDate, endDate, category } = query || {};
    console.log('1. Request Data:', { appId, startDate, endDate, category });

    const isValidDate = (d: any) => {
      const date = new Date(d);
      return date instanceof Date && !isNaN(date.getTime());
    };

    const dateFilter = (qb: any, prefix: string, dateField: string) => {
      if (startDate && isValidDate(startDate)) {
        qb.andWhere(`${prefix}.${dateField} >= :startDate`, { startDate: new Date(startDate) });
      }
      if (endDate && isValidDate(endDate)) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        qb.andWhere(`${prefix}.${dateField} <= :endDate`, { endDate: end });
      }
    };

    const prevDateFilter = (qb: any, prefix: string, dateField: string) => {
      if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - diff);
        const prevEnd = new Date(end.getTime() - diff);
        qb.andWhere(`${prefix}.${dateField} >= :prevStart`, { prevStart });
        qb.andWhere(`${prefix}.${dateField} <= :prevEnd`, { prevEnd });
      } else {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        qb.andWhere(`${prefix}.${dateField} >= :prevStart`, { prevStart: previousMonthStart });
        qb.andWhere(`${prefix}.${dateField} <= :prevEnd`, { prevEnd: previousMonthEnd });
      }
    };

    const applyCategoryFilter = (qb: any, prefix: string) => {
      const isInvalidCategory = !category || 
        category === 'All Categories' || 
        category === 'All' || 
        category === 'all' || 
        category === 'undefined' || 
        category === 'null';
        
      if (!isInvalidCategory) {
        qb.andWhere(`${prefix}.category = :category`, { category });
      }
    };

    try {
      // 1. Summary
      const incomeQb = this.incomeRepository.createQueryBuilder('inc').select('SUM(inc.amount)', 'total').where('inc.appId = :appId', { appId });
      dateFilter(incomeQb, 'inc', 'incomeDate');
      applyCategoryFilter(incomeQb, 'inc');
      const incomeResult = await incomeQb.getRawOne();
      const totalIncome = Number(incomeResult?.total || 0);

      const prevIncomeQb = this.incomeRepository.createQueryBuilder('inc').select('SUM(inc.amount)', 'total').where('inc.appId = :appId', { appId });
      prevDateFilter(prevIncomeQb, 'inc', 'incomeDate');
      applyCategoryFilter(prevIncomeQb, 'inc');
      const prevIncomeResult = await prevIncomeQb.getRawOne();
      const prevTotalIncome = Number(prevIncomeResult?.total || 0);

      const expenseQb = this.expenseRepository.createQueryBuilder('exp').select('SUM(exp.amount)', 'total').where('exp.appId = :appId', { appId });
      dateFilter(expenseQb, 'exp', 'expenseDate');
      applyCategoryFilter(expenseQb, 'exp');
      const expenseResult = await expenseQb.getRawOne();
      const totalExpense = Number(expenseResult?.total || 0);

      const prevExpenseQb = this.expenseRepository.createQueryBuilder('exp').select('SUM(exp.amount)', 'total').where('exp.appId = :appId', { appId });
      prevDateFilter(prevExpenseQb, 'exp', 'expenseDate');
      applyCategoryFilter(prevExpenseQb, 'exp');
      const prevExpenseResult = await prevExpenseQb.getRawOne();
      const prevTotalExpense = Number(prevExpenseResult?.total || 0);

      const pendingInvoiceQb = this.invoiceRepository.createQueryBuilder('inv')
        .select('COUNT(inv.id)', 'count')
        .addSelect('SUM(inv.totalAmount)', 'total')
        .where('inv.appId = :appId', { appId })
        .andWhere('inv.paymentStatus = :paymentStatus', { paymentStatus: 'unpaid' })
        .andWhere('inv.status != :invStatus', { invStatus: 'cancelled' });
      dateFilter(pendingInvoiceQb, 'inv', 'createdAt');
      const pendingInvoiceResult = await pendingInvoiceQb.getRawOne();
      
      const calculateGrowth = (current: number, previous: number) => {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const netProfit = totalIncome - totalExpense;
      const prevNetProfit = prevTotalIncome - prevTotalExpense;

      const summary = {
        totalIncome,
        incomeGrowth: calculateGrowth(totalIncome, prevTotalIncome),
        totalExpense,
        expenseGrowth: calculateGrowth(totalExpense, prevTotalExpense),
        netProfit,
        profitGrowth: calculateGrowth(netProfit, prevNetProfit),
        pendingInvoicesCount: Number(pendingInvoiceResult?.count || 0),
        pendingInvoicesAmount: Number(pendingInvoiceResult?.total || 0)
      };
      
      console.log('2. Summary Data Fetched:', summary);

      // 2. Trend Data
      const trendIncomeQb = this.incomeRepository.createQueryBuilder('inc')
        .select('DATE_FORMAT(inc.incomeDate, "%b")', 'name')
        .addSelect('SUM(inc.amount)', 'income')
        .where('inc.appId = :appId', { appId })
        .groupBy('name')
        .orderBy('MIN(inc.incomeDate)', 'ASC');
      dateFilter(trendIncomeQb, 'inc', 'incomeDate');
      applyCategoryFilter(trendIncomeQb, 'inc');
      const trendIncome = await trendIncomeQb.getRawMany() || [];

      const trendExpenseQb = this.expenseRepository.createQueryBuilder('exp')
        .select('DATE_FORMAT(exp.expenseDate, "%b")', 'name')
        .addSelect('SUM(exp.amount)', 'expense')
        .where('exp.appId = :appId', { appId })
        .groupBy('name')
        .orderBy('MIN(exp.expenseDate)', 'ASC');
      dateFilter(trendExpenseQb, 'exp', 'expenseDate');
      applyCategoryFilter(trendExpenseQb, 'exp');
      const trendExpense = await trendExpenseQb.getRawMany() || [];

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendMap = new Map();
      
      // Initialize map with all 12 months to maintain order and show 0 values
      months.forEach(m => trendMap.set(m, { name: m, income: 0, expense: 0 }));

      trendIncome.forEach(item => {
        if (item.name && trendMap.has(item.name)) {
          trendMap.get(item.name).income = Number(item.income || 0);
        }
      });
      trendExpense.forEach(item => {
        if (item.name && trendMap.has(item.name)) {
          trendMap.get(item.name).expense = Number(item.expense || 0);
        }
      });
      
      const trendData = Array.from(trendMap.values());
      
      console.log('3. Trend Data Fetched');

      // 3. Category Data
      // Get all expense categories to ensure we show 0 for unused ones
      let accountCategories: any[] = [];
      let combinedCategories: any[] = [];
      
      try {
        accountCategories = await this.categoryRepository.find({ where: { appId, type: CategoryType.EXPENSE } });
        combinedCategories = await this.categoryManagementService.getCombinedExpenseCategories('all');
      } catch (e) {
        console.error('Error fetching categories for dashboard:', e);
      }

      const allExpenseCategories = [
        ...accountCategories.map(c => c.name),
        ...combinedCategories.map(c => c.name)
      ];

      const categoryQb = this.expenseRepository.createQueryBuilder('exp')
        .select('exp.category', 'name')
        .addSelect('SUM(exp.amount)', 'value')
        .where('exp.appId = :appId', { appId })
        .andWhere('exp.category IS NOT NULL')
        .groupBy('exp.category');
      dateFilter(categoryQb, 'exp', 'expenseDate');
      const categoryDataResult = await categoryQb.getRawMany() || [];
      
      const categoryMap = new Map<string, number>();
      
      // Initialize with 0 for all categories
      allExpenseCategories.forEach(name => {
        if (name) categoryMap.set(name, 0);
      });
      
      // Populate actual values
      categoryDataResult.forEach(item => {
        if (item.name) categoryMap.set(item.name, Number(item.value || 0));
      });
      
      const categoryData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort descending by value

      console.log('4. Category Data Fetched');

      // 4. Invoice Status Data
      const invoiceStatusQb = this.invoiceRepository.createQueryBuilder('inv')
        .select('inv.paymentStatus', 'name')
        .addSelect('SUM(inv.totalAmount)', 'value')
        .where('inv.appId = :appId', { appId })
        .andWhere('inv.status != :invStatus', { invStatus: 'cancelled' })
        .groupBy('inv.paymentStatus');
      dateFilter(invoiceStatusQb, 'inv', 'createdAt');
      const invoiceStatusResult = await invoiceStatusQb.getRawMany() || [];
      const invoiceStatusData = invoiceStatusResult
        .filter(item => item.name)
        .map(item => {
          let name = item.name;
          if (name === 'unpaid') name = 'Pending';
          else if (name === 'paid') name = 'Paid';
          else name = name.charAt(0).toUpperCase() + name.slice(1);
          return { name, value: Number(item.value || 0) };
        });

      console.log('5. Invoice Status Data Fetched');

      // 5. Top Expenses
      const topExpensesQb = this.expenseRepository.createQueryBuilder('exp')
        .where('exp.appId = :appId', { appId })
        .orderBy('exp.amount', 'DESC')
        .limit(5);
      dateFilter(topExpensesQb, 'exp', 'expenseDate');
      applyCategoryFilter(topExpensesQb, 'exp');
      const topExpensesResult = await topExpensesQb.getMany() || [];
      const topExpenses = topExpensesResult.map((exp, idx) => ({
        id: exp.id,
        name: exp.description || exp.category || 'Expense',
        amount: `$${Number(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        date: exp.expenseDate ? exp.expenseDate.toISOString().split('T')[0] : ''
      }));

      console.log('6. Top Expenses Fetched');

      // 6. Recent Transactions
      const recentIncomesQb = this.incomeRepository.createQueryBuilder('inc')
        .where('inc.appId = :appId', { appId })
        .orderBy('inc.incomeDate', 'DESC')
        .limit(10);
      dateFilter(recentIncomesQb, 'inc', 'incomeDate');
      applyCategoryFilter(recentIncomesQb, 'inc');
      const recentIncomes = await recentIncomesQb.getMany() || [];

      const recentExpensesQb = this.expenseRepository.createQueryBuilder('exp')
        .where('exp.appId = :appId', { appId })
        .orderBy('exp.expenseDate', 'DESC')
        .limit(10);
      dateFilter(recentExpensesQb, 'exp', 'expenseDate');
      applyCategoryFilter(recentExpensesQb, 'exp');
      const recentExpenses = await recentExpensesQb.getMany() || [];

      const transactions = [
        ...recentIncomes.map(inc => ({
          id: `TRX-${inc.id}-I`,
          type: 'Income',
          category: inc.category || 'Income',
          amount: `+$${Number(inc.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          date: inc.incomeDate ? inc.incomeDate.toISOString().split('T')[0] : '',
          status: inc.status === 'received' ? 'Completed' : 'Pending',
          rawDate: inc.incomeDate || new Date()
        })),
        ...recentExpenses.map(exp => ({
          id: `TRX-${exp.id}-E`,
          type: 'Expense',
          category: exp.category || 'Expense',
          amount: `-$${Number(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          date: exp.expenseDate ? exp.expenseDate.toISOString().split('T')[0] : '',
          status: exp.status === 'paid' ? 'Completed' : 'Pending',
          rawDate: exp.expenseDate || new Date()
        }))
      ];

      transactions.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      const recentTransactions = transactions.slice(0, 10).map(({ rawDate, ...rest }) => rest);

      console.log('7. Recent Transactions Fetched');

      return {
        summary,
        trendData,
        categoryData,
        invoiceStatusData,
        topExpenses,
        recentTransactions
      };
    } catch (error) {
      console.error('Error fetching dashboard reports:', error);
      throw error;
    }
  }

  // ==================== INCOME METHODS ====================

  async createIncome(dto: CreateIncomeDto, file?: Express.Multer.File): Promise<Income> {
    const { appId, userId } = this.context();
    if (dto.customerId) await this.assertTenantUser(appId, dto.customerId);

    const tempIncomeNumber = `INC-${appId}-T-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const income = this.incomeRepository.create({
      ...dto,
      appId,
      incomeNumber: tempIncomeNumber,
      incomeDate: new Date(dto.incomeDate),
      status: dto.status ?? IncomeStatus.RECEIVED,
      createdBy: userId,
    });
    const savedIncome = await this.incomeRepository.save(income);
    savedIncome.incomeNumber = `INC-${appId}-${String(savedIncome.id).padStart(6, '0')}`;
    const updatedIncome = await this.incomeRepository.save(savedIncome);

    if (file) {
      await this.addIncomeAttachment(updatedIncome.id, file);
    }

    return updatedIncome;
  }

  async addIncomeAttachment(incomeId: number, file: Express.Multer.File): Promise<Media> {
    const income = await this.findOneIncome(incomeId);
    const { appId } = this.context();
    return this.mediaService.uploadFile(file, {
      model: 'Income',
      modelId: income.id,
      appId,
      note: `Receipt for ${income.incomeNumber}`,
    });
  }

  async findAllIncomes(query: IncomeQueryDto) {
    const { appId } = this.context();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    
    // 1. Build query without joins for fast counting and pagination
    const builder = this.incomeRepository
      .createQueryBuilder('income')
      .where('income.appId = :appId', { appId });

    if (query.search) {
      builder.andWhere(
        new Brackets((where) =>
          where
            .where('income.incomeNumber LIKE :search', { search: `%${query.search}%` })
            .orWhere('income.source LIKE :search', { search: `%${query.search}%` })
            .orWhere('income.category LIKE :search', { search: `%${query.search}%` })
            .orWhere('income.reference LIKE :search', { search: `%${query.search}%` }),
        ),
      );
    }
    if (query.status) builder.andWhere('income.status = :status', { status: query.status });
    if (query.fromDate) builder.andWhere('income.incomeDate >= :fromDate', { fromDate: new Date(query.fromDate) });
    if (query.toDate) {
      const endOfDay = new Date(query.toDate);
      endOfDay.setHours(23, 59, 59, 999);
      builder.andWhere('income.incomeDate <= :endOfDay', { endOfDay });
    }

    // 2. Fetch paginated IDs and total count (fast, no DISTINCT, no JOINs)
    const [incomes, total] = await builder
      .orderBy('income.incomeDate', 'DESC')
      .addOrderBy('income.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getManyAndCount();

    if (incomes.length === 0) {
      return { data: [], pagination: { page, limit, total, lastPage: 0 } };
    }

    // 3. Fetch full data with relations only for the paginated subset
    const data = await this.incomeRepository.find({
      where: { id: In(incomes.map(i => i.id)) },
      relations: { customer: true },
      order: { incomeDate: 'DESC', id: 'DESC' },
    });

    return { data, pagination: { page, limit, total, lastPage: Math.ceil(total / limit) } };
  }

  async findOneIncome(id: number): Promise<Income> {
    const { appId } = this.context();
    const income = await this.incomeRepository.findOne({
      where: { id, appId },
      relations: { customer: true },
    });
    if (!income) throw new NotFoundException('Income record not found');
    return income;
  }

  async updateIncome(id: number, dto: UpdateIncomeDto): Promise<Income> {
    const { appId, userId } = this.context();
    const income = await this.findOneIncome(id);
    if (dto.customerId) await this.assertTenantUser(appId, dto.customerId);
    Object.assign(income, dto, {
      incomeDate: dto.incomeDate ? new Date(dto.incomeDate) : income.incomeDate,
      updatedBy: userId,
    });
    return this.incomeRepository.save(income);
  }

  async removeIncome(id: number): Promise<void> {
    const income = await this.findOneIncome(id);
    await this.incomeRepository.remove(income);
  }

  // ==================== EXPENSE CRUD METHODS ====================

  async createExpense(dto: CreateExpenseDto, file?: Express.Multer.File): Promise<Expense> {
    const { appId, userId } = this.context();
    const tempExpenseNumber = `EXP-${appId}-T-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const expense = this.expenseRepository.create({
      ...dto,
      appId,
      expenseNumber: tempExpenseNumber,
      expenseDate: new Date(dto.expenseDate),
      status: dto.status ?? ExpenseStatus.PAID,
      createdBy: userId,
    });
    const savedExpense = await this.expenseRepository.save(expense);
    savedExpense.expenseNumber = `EXP-${appId}-${String(savedExpense.id).padStart(6, '0')}`;
    const updatedExpense = await this.expenseRepository.save(savedExpense);

    if (file) {
      await this.addExpenseAttachment(updatedExpense.id, file);
    }

    return updatedExpense;
  }

  async findAllExpenses(query: ExpenseQueryDto) {
    const { appId } = this.context();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const builder = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.appId = :appId', { appId });

    if (query.search) {
      builder.andWhere(
        new Brackets((where) =>
          where
            .where('expense.expenseNumber LIKE :search', { search: `%${query.search}%` })
            .orWhere('expense.category LIKE :search', { search: `%${query.search}%` })
            .orWhere('expense.vendor LIKE :search', { search: `%${query.search}%` })
            .orWhere('expense.reference LIKE :search', { search: `%${query.search}%` })
            .orWhere('expense.description LIKE :search', { search: `%${query.search}%` }),
        ),
      );
    }
    if (query.status) builder.andWhere('expense.status = :status', { status: query.status });
    if (query.category) builder.andWhere('expense.category = :category', { category: query.category });
    if (query.fromDate) builder.andWhere('expense.expenseDate >= :fromDate', { fromDate: new Date(query.fromDate) });
    if (query.toDate) {
      const endOfDay = new Date(query.toDate);
      endOfDay.setHours(23, 59, 59, 999);
      builder.andWhere('expense.expenseDate <= :endOfDay', { endOfDay });
    }

    const [data, total] = await builder
      .orderBy('expense.expenseDate', 'DESC')
      .addOrderBy('expense.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getManyAndCount();

    return { data, pagination: { page, limit, total, lastPage: Math.ceil(total / limit) } };
  }

  async findOneExpense(id: number): Promise<Expense & { attachments?: Media[] }> {
    const { appId } = this.context();
    const expense = await this.expenseRepository.findOne({
      where: { id, appId },
    });
    if (!expense) throw new NotFoundException('Expense record not found');

    const attachments = await this.mediaRepository.find({
      where: { model: 'Expense', modelId: id, appId },
    });

    return Object.assign(expense, { attachments });
  }

  async updateExpense(id: number, dto: UpdateExpenseDto): Promise<Expense> {
    const { userId } = this.context();
    const expense = await this.findOneExpense(id);
    Object.assign(expense, dto, {
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : expense.expenseDate,
      updatedBy: userId,
    });
    return this.expenseRepository.save(expense);
  }

  async removeExpense(id: number): Promise<void> {
    const expense = await this.findOneExpense(id);
    await this.expenseRepository.remove(expense);
  }

  // ==================== BULK EXPENSE OPERATIONS ====================

  async bulkDeleteExpenses(ids: number[]): Promise<{ count: number }> {
    const { appId } = this.context();
    const expenses = await this.expenseRepository.find({
      where: { id: In(ids), appId },
    });
    if (expenses.length === 0) return { count: 0 };
    await this.expenseRepository.remove(expenses);
    return { count: expenses.length };
  }

  async bulkStatusUpdateExpenses(ids: number[], status: ExpenseStatus): Promise<{ count: number }> {
    const { appId, userId } = this.context();
    const result = await this.expenseRepository
      .createQueryBuilder()
      .update(Expense)
      .set({ status, updatedBy: userId })
      .where('id IN (:...ids) AND appId = :appId', { ids, appId })
      .execute();

    return { count: result.affected ?? 0 };
  }

  // ==================== CATEGORY MANAGEMENT METHODS ====================

  async findAllCategories(type: CategoryType = CategoryType.EXPENSE) {
    const { appId } = this.context();
    return this.categoryRepository.find({
      where: { appId, type, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createCategory(dto: CreateCategoryDto): Promise<AccountCategory> {
    const { appId, userId } = this.context();
    
    if (dto.source === 'master') {
      await this.assertMasterCategoryPermission(appId, userId);
    }
    
    const existing = await this.categoryRepository.findOne({
      where: { appId, name: dto.name, type: dto.type ?? CategoryType.EXPENSE },
    });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.description = dto.description ?? existing.description;
        existing.updatedBy = userId;
        return this.categoryRepository.save(existing);
      }
      throw new BadRequestException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      ...dto,
      appId,
      createdBy: userId,
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<AccountCategory> {
    const { appId, userId } = this.context();
    const category = await this.categoryRepository.findOne({ where: { id, appId } });
    if (!category) throw new NotFoundException('Category not found');

    if (category.source === 'master' || dto.source === 'master') {
      await this.assertMasterCategoryPermission(appId, userId);
    }

    const oldName = category.name;
    const newName = dto.name;

    Object.assign(category, dto, { updatedBy: userId });
    const savedCategory = await this.categoryRepository.save(category);

    if (newName && oldName !== newName) {
      if (category.type === CategoryType.EXPENSE) {
        await this.expenseRepository
          .createQueryBuilder()
          .update(Expense)
          .set({ category: newName })
          .where('appId = :appId AND category = :oldName', { appId, oldName })
          .execute();
      } else if (category.type === CategoryType.INCOME) {
        await this.incomeRepository
          .createQueryBuilder()
          .update(Income)
          .set({ category: newName })
          .where('appId = :appId AND category = :oldName', { appId, oldName })
          .execute();
      }
    }

    return savedCategory;
  }

  async removeCategory(id: number): Promise<void> {
    const { appId } = this.context();
    const category = await this.categoryRepository.findOne({ where: { id, appId } });
    if (!category) throw new NotFoundException('Category not found');
    
    const { userId } = this.context();
    if (category.source === 'master') {
      await this.assertMasterCategoryPermission(appId, userId);
    }
    
    await this.categoryRepository.remove(category);
  }

  // ==================== SUMMARY & ANALYTICS ====================

  async getExpenseSummary(query: ExpenseSummaryQueryDto) {
    const { appId } = this.context();
    const qb = this.expenseRepository
      .createQueryBuilder('expense')
      .select(`SUM(CASE WHEN expense.status != 'cancelled' THEN expense.amount ELSE 0 END)`, 'totalExpenses')
      .addSelect(`SUM(CASE WHEN expense.status = 'paid' THEN expense.amount ELSE 0 END)`, 'paidAmount')
      .addSelect(`SUM(CASE WHEN expense.status = 'pending' THEN expense.amount ELSE 0 END)`, 'pendingAmount')
      .addSelect(`COUNT(expense.id)`, 'totalCount')
      .where('expense.appId = :appId', { appId });

    if (query.category) qb.andWhere('expense.category = :category', { category: query.category });
    if (query.fromDate) qb.andWhere('expense.expenseDate >= :fromDate', { fromDate: new Date(query.fromDate) });
    if (query.toDate) {
      const endOfDay = new Date(query.toDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('expense.expenseDate <= :endOfDay', { endOfDay });
    }

    const raw = await qb.getRawOne();
    console.log('DEBUG RAW SUMMARY:', raw);

    const categoryQb = this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addSelect('COUNT(expense.id)', 'count')
      .where('expense.appId = :appId', { appId });

    if (query.category) categoryQb.andWhere('expense.category = :category', { category: query.category });
    if (query.fromDate) categoryQb.andWhere('expense.expenseDate >= :fromDate', { fromDate: new Date(query.fromDate) });
    if (query.toDate) {
      const endOfDay = new Date(query.toDate);
      endOfDay.setHours(23, 59, 59, 999);
      categoryQb.andWhere('expense.expenseDate <= :endOfDay', { endOfDay });
    }

    const categoryBreakdownRaw = await categoryQb.groupBy('expense.category').getRawMany();

    return {
      totalExpenses: Number(raw?.totalExpenses ?? raw?.totalexpenses ?? 0),
      paidAmount: Number(raw?.paidAmount ?? raw?.paidamount ?? 0),
      pendingAmount: Number(raw?.pendingAmount ?? raw?.pendingamount ?? 0),
      totalCount: Number(raw?.totalCount ?? raw?.totalcount ?? 0),
      categoryBreakdown: categoryBreakdownRaw.map((item) => ({
        category: item.category || 'Uncategorized',
        totalAmount: Number(item.totalAmount ?? item.totalamount ?? 0),
        count: Number(item.count ?? 0),
      })),
    };
  }

  // ==================== ATTACHMENTS & RECEIPTS ====================

  async addExpenseAttachment(expenseId: number, file: Express.Multer.File): Promise<Media> {
    const expense = await this.findOneExpense(expenseId);
    const { appId } = this.context();

    return this.mediaService.uploadFile(file, {
      model: 'Expense',
      modelId: expense.id,
      appId,
      note: `Receipt for ${expense.expenseNumber}`,
    });
  }

  async getExpenseAttachment(expenseId: number, fileId: number): Promise<Media> {
    const { appId } = this.context();
    await this.findOneExpense(expenseId);

    const media = await this.mediaRepository.findOne({
      where: { id: fileId, model: 'Expense', modelId: expenseId, appId },
    });
    if (!media) throw new NotFoundException('Attachment file not found');
    try {
      return await this.mediaService.downloadFileFromAwsByFileNameIfMissing(media);
    } catch {
      return media;
    }
  }

  async removeExpenseAttachment(expenseId: number, fileId: number): Promise<void> {
    const { appId } = this.context();
    await this.findOneExpense(expenseId);

    const media = await this.mediaRepository.findOne({
      where: { id: fileId, model: 'Expense', modelId: expenseId, appId },
    });
    if (!media) throw new NotFoundException('Attachment file not found');

    await this.mediaService.deleteFile(media.id);
  }

  // ==================== REPORTS & EXPORT ====================

  async exportExpensesCsv(query: ExportExpenseQueryDto): Promise<string> {
    const result = await this.findAllExpenses({
      page: 1,
      limit: 1000,
      search: query.search,
      status: query.status,
      category: query.category,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });

    const headers = [
      'Expense Number',
      'Category',
      'Description',
      'Amount',
      'Currency',
      'Expense Date',
      'Payment Method',
      'Vendor',
      'Reference',
      'Status',
    ];

    const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = result.data.map((exp) =>
      [
        exp.expenseNumber,
        exp.category,
        exp.description || '',
        exp.amount,
        exp.currency,
        exp.expenseDate ? new Date(exp.expenseDate).toISOString().split('T')[0] : '',
        exp.paymentMethod || '',
        exp.vendor || '',
        exp.reference || '',
        exp.status,
      ]
        .map(escape)
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  async generatePaymentVoucherPdf(id: number): Promise<Buffer> {
    const expense = await this.findOneExpense(id);

    const formattedDate = expense.expenseDate
      ? new Date(expense.expenseDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB');

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      doc.fontSize(20).text('PAYMENT VOUCHER', { align: 'center' }).moveDown();
      doc.fontSize(12).text('--------------------------------------------------');
      
      doc.text(`Voucher No   : ${expense.expenseNumber}`);
      doc.text(`Date         : ${formattedDate}`);
      doc.text(`Status       : ${expense.status.toUpperCase()}`);
      doc.text(`Category     : ${expense.category}`);
      doc.text(`Vendor/Payee : ${expense.vendor || 'N/A'}`);
      doc.text(`Payment Mode : ${expense.paymentMethod || 'N/A'}`);
      doc.text(`Reference    : ${expense.reference || 'N/A'}`);
      
      doc.text('--------------------------------------------------').moveDown();
      doc.text(`Description  : ${expense.description || 'N/A'}`).moveDown();
      doc.text('--------------------------------------------------');
      doc.fontSize(14).text(`AMOUNT PAID  : ${expense.currency} ${Number(expense.amount).toFixed(2)}`, { bold: true });
      doc.fontSize(12).text('--------------------------------------------------').moveDown();
      
      doc.text(`Notes        : ${expense.notes || 'N/A'}`).moveDown(3);
      
      doc.text('Authorized Signature: ____________________').moveDown(2);
      doc.text('Thank you for your business.', { align: 'center' });
      
      doc.end();
    });
  }

  // ==================== HELPER METHODS ====================

  private context(): { appId: number; userId: number } {
    const appId = Number(RequestContext.get('activeAppId'));
    const userId = Number(RequestContext.get('userId'));
    if (!appId || !userId)
      throw new BadRequestException('Active tenant and user context are required');
    return { appId, userId };
  }

  private async assertTenantUser(appId: number, userId: number): Promise<void> {
    const membership = await this.appUserRepository.findOne({
      where: { appId, userId, isActive: true },
    });
    if (!membership)
      throw new BadRequestException('User does not belong to the active company');
  }

  private async assertMasterCategoryPermission(appId: number, userId: number): Promise<void> {
    const userRoles = await this.appUserRepository.manager.find(UserRole, {
      where: { userId, appId },
      relations: ['role'],
    });

    const hasPermission = userRoles.some(ur => 
      ur.role?.code === 'super_admin'
    );

    if (!hasPermission) {
      throw new BadRequestException("You don't have permission to modify master categories");
    }
  }
}