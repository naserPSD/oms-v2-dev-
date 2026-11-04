import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterIncomeCategory } from './entities/master-income-category.entity';
import { MasterExpenseCategory } from './entities/master-expense-category.entity';
import { UserIncomeCategory } from './entities/user-income-category.entity';
import { UserExpenseCategory } from './entities/user-expense-category.entity';
import { CreateMasterCategoryDto, UpdateMasterCategoryDto, CreateUserCategoryDto, UpdateUserCategoryDto } from './dto/category-management.dto';
import { RequestContext } from '@common/request-context';

@Injectable()
export class CategoryManagementService {
  constructor(
    @InjectRepository(MasterIncomeCategory) private readonly masterIncRepo: Repository<MasterIncomeCategory>,
    @InjectRepository(MasterExpenseCategory) private readonly masterExpRepo: Repository<MasterExpenseCategory>,
    @InjectRepository(UserIncomeCategory) private readonly userIncRepo: Repository<UserIncomeCategory>,
    @InjectRepository(UserExpenseCategory) private readonly userExpRepo: Repository<UserExpenseCategory>,
  ) {}

  private context(): { appId: number; userId: number } {
    const appId = Number(RequestContext.get('activeAppId'));
    const userId = Number(RequestContext.get('userId'));
    if (!appId || !userId)
      throw new Error(`Active tenant and user context are required (appId: ${appId}, userId: ${userId})`);
    return { appId, userId };
  }

  private applyDefined<T extends object>(entity: T, dto: object) {
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined) {
        (entity as Record<string, unknown>)[key] = value;
      }
    });
  }

  // ==== MASTER ====
  async getMasterIncomeCategories() { return this.masterIncRepo.find(); }
  async createMasterIncome(dto: CreateMasterCategoryDto) { return this.masterIncRepo.save(this.masterIncRepo.create(dto)); }
  async updateMasterIncome(id: number, dto: UpdateMasterCategoryDto) {
    const cat = await this.masterIncRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    this.applyDefined(cat, dto);
    return this.masterIncRepo.save(cat);
  }
  async deleteMasterIncome(id: number) {
    const cat = await this.masterIncRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.masterIncRepo.remove(cat);
    return { message: 'Deleted' };
  }

  async getMasterExpenseCategories() { return this.masterExpRepo.find(); }
  async createMasterExpense(dto: CreateMasterCategoryDto) { return this.masterExpRepo.save(this.masterExpRepo.create(dto)); }
  async updateMasterExpense(id: number, dto: UpdateMasterCategoryDto) {
    const cat = await this.masterExpRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    this.applyDefined(cat, dto);
    return this.masterExpRepo.save(cat);
  }
  async deleteMasterExpense(id: number) {
    const cat = await this.masterExpRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.masterExpRepo.remove(cat);
    return { message: 'Deleted' };
  }

  // ==== USER ====
  async getUserIncomeCategories() {
    const { userId, appId } = this.context();
    return this.userIncRepo.find({ where: { userId, appId } });
  }
  async createUserIncome(dto: CreateUserCategoryDto) {
    const { userId, appId } = this.context();
    return this.userIncRepo.save(this.userIncRepo.create({ ...dto, userId, appId }));
  }
  async updateUserIncome(id: number, dto: UpdateUserCategoryDto) {
    const { userId, appId } = this.context();
    const cat = await this.userIncRepo.findOne({ where: { id, userId, appId } });
    if (!cat) throw new NotFoundException('Category not found');
    this.applyDefined(cat, dto);
    return this.userIncRepo.save(cat);
  }
  async deleteUserIncome(id: number) {
    const { userId, appId } = this.context();
    const cat = await this.userIncRepo.findOne({ where: { id, userId, appId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.userIncRepo.remove(cat);
    return { message: 'Deleted' };
  }

  async getUserExpenseCategories() {
    const { userId, appId } = this.context();
    return this.userExpRepo.find({ where: { userId, appId } });
  }
  async createUserExpense(dto: CreateUserCategoryDto) {
    const { userId, appId } = this.context();
    return this.userExpRepo.save(this.userExpRepo.create({ ...dto, userId, appId }));
  }
  async updateUserExpense(id: number, dto: UpdateUserCategoryDto) {
    const { userId, appId } = this.context();
    const cat = await this.userExpRepo.findOne({ where: { id, userId, appId } });
    if (!cat) throw new NotFoundException('Category not found');
    this.applyDefined(cat, dto);
    return this.userExpRepo.save(cat);
  }
  async deleteUserExpense(id: number) {
    const { userId, appId } = this.context();
    const cat = await this.userExpRepo.findOne({ where: { id, userId, appId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.userExpRepo.remove(cat);
    return { message: 'Deleted' };
  }

  // ==== COMBINED ====
  async getCombinedIncomeCategories(status?: string) {
    const { userId, appId } = this.context();
    const whereMaster: any = status === 'all' ? {} : { isActive: true };
    const whereUser: any = { userId, appId, ...(status === 'all' ? {} : { isActive: true }) };
    
    const [master, user] = await Promise.all([
      this.masterIncRepo.find({ where: whereMaster }),
      this.userIncRepo.find({ where: whereUser })
    ]);
    return [...master.map(m => ({ ...m, source: 'master' })), ...user.map(u => ({ ...u, source: 'user' }))];
  }

  async getCombinedExpenseCategories(status?: string) {
    const { userId, appId } = this.context();
    const whereMaster: any = status === 'all' ? {} : { isActive: true };
    const whereUser: any = { userId, appId, ...(status === 'all' ? {} : { isActive: true }) };
    
    const [master, user] = await Promise.all([
      this.masterExpRepo.find({ where: whereMaster }),
      this.userExpRepo.find({ where: whereUser })
    ]);
    return [...master.map(m => ({ ...m, source: 'master' })), ...user.map(u => ({ ...u, source: 'user' }))];
  }

  // ==== IMPORT MASTER DEFAULTS ====
  async importMasterCategories() {
    const defaultIncomeCategories = [
      'Sales Revenue', 'Product Sales', 'Service Revenue', 'Subscription Revenue',
      'SaaS Revenue', 'Recurring Revenue', 'Project Revenue', 'Consulting Revenue',
      'Professional Services', 'Commission Income', 'Brokerage Income', 'Referral Income',
      'Affiliate Income', 'Licensing Income', 'Royalty Income', 'Contract Revenue',
      'Maintenance Revenue', 'Support Revenue', 'Implementation Revenue', 'Setup & Onboarding Fees',
      'Customization Revenue', 'Integration Fees', 'Interest Income', 'Investment Income',
      'Dividend Income', 'Rental Income', 'Asset Sale Income', 'Foreign Exchange Gain',
      'Cashback & Rebates', 'Other Income'
    ];

    const defaultExpenseCategories = [
      'Salaries & Wages', 'Office Rent', 'Utilities', 'Software & Subscriptions',
      'Cloud & Hosting', 'Marketing & Advertising', 'Travel & Transportation', 'Office Supplies',
      'Equipment & Hardware', 'Professional Services', 'Bank & Payment Processing Fees',
      'Taxes & Government Fees', 'Refunds & Chargebacks', 'Other Expenses'
    ];

    let addedIncome = 0;
    let addedExpense = 0;

    for (const name of defaultIncomeCategories) {
      const exists = await this.masterIncRepo.findOne({ where: { name } });
      if (!exists) {
        await this.masterIncRepo.save(this.masterIncRepo.create({ name, description: 'System Default' }));
        addedIncome++;
      }
    }

    for (const name of defaultExpenseCategories) {
      const exists = await this.masterExpRepo.findOne({ where: { name } });
      if (!exists) {
        await this.masterExpRepo.save(this.masterExpRepo.create({ name, description: 'System Default' }));
        addedExpense++;
      }
    }

    return {
      message: `Master categories imported successfully. Added ${addedIncome} income and ${addedExpense} expense categories.`
    };
  }
}
