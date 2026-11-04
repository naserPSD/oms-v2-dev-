import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Repository, Not, IsNull } from 'typeorm';
import { APIFeatures } from '@core/utils/apiFeatures';
import { Subscription } from './entities/subscription.entity';

import { AppUser } from '@module/users/entities/app-user.entity';
import { SubscriptionInvoice } from './entities/subscription-invoices.entity';

import { RequestContext } from '@common/request-context';
import { Status } from '@module/status/entities/status.entity';
import { CreateSubscriptionPlanDto } from './dto/subscription-plan.dto';
import { CreateSubscriptionDto, SubscribeDto } from './dto/subscriptions.dto';
import { CreateCouponDto } from './dto/coupons.dto';
import { Coupon } from './entities/coupons.entity';
import { CreateSubscriptionInvoiceDto } from './dto/subscription-invoices.dto';
import { Invoice, PaymentStatus } from './entities/invoices.entity';
import { CreateInvoiceDto } from './dto/invoices.dto';
import { EntityManager } from 'typeorm';
export interface RawSubscriberRow {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  typeName?: string | null;
  sizeName?: string | null;
  isActive: number | boolean;
  createdAt: Date | string;
  logoFolderPath: string | null;
  logoFilename: string | null;
  subscription?: string | SubscriptionParsed | null;
  latestInvoice?: string | InvoiceParsed | null;
  latestSubscriptionInvoice?: string | SubscriptionInvoiceParsed | null;
  purchaseHistory?: string | PurchaseHistoryItem[] | null;
  totalUsers: number | string;
  activeUsers: number | string;
  owner?: string | OwnerParsed | null;
}

export interface PurchaseHistoryItem {
  id: number;
  invoiceNumber: string;
  totalAmount: number | string;
  currency?: string;
  status?: string;
  paymentStatus?: string;
  paidAt?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
  planName?: string | null;
  transactionId?: string | null;
  paymentMethod?: string | null;
  gateway?: string | null;
}

export interface SubscriptionParsed {
  id?: number;
  planId?: number;
  planName?: string;
  planSlug?: string;
  description?: string;
  currency?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  startDate?: string;
  endDate?: string;
  statusId?: number;
  statusCode?: string;
  statusName?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
  trialDays?: number;
  minUsers?: number;
  maxUsers?: number;
}

export interface InvoiceParsed {
  id?: number;
  invoiceNumber?: string;
  totalAmount?: number | string;
  status?: string;
  paymentStatus?: string;
  paidAt?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
}

export interface SubscriptionInvoiceParsed {
  id?: number;
  amount?: number | string;
  statusId?: number;
  statusName?: string;
  statusCode?: string;
  paidAt?: string | null;
  transactionId?: string | null;
  dueDate?: string | null;
}

export interface OwnerParsed {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface RawSummaryRow {
  totalCompanies: number | string;
  activeCompanies: number | string;
  inactiveCompanies: number | string;
  purchasedCompanies: number | string;
  trialCompanies: number | string;
}

export interface RevenueSummaryRow {
  totalPaidAmount: number | string;
}

export interface AppSubStatusRow {
  id: number;
  name: string;
  code: string;
  colorName?: string | null;
}

export interface SubscriberQueryParams {
  search?: string;
  planType?: string;
  status?: string;
  subscriptionStatus?: string;
  statusId?: number | string;
  companyStatus?: string;
}

export interface ActivePlanSummaryRow {
  id: number;
  name: string;
  slug: string;
  monthly_price: number | string;
  yearly_price: number | string;
  companyCount: number | string;
}

export interface AppToggleRow {
  id: number;
  name: string;
  is_active: number;
}

@Injectable()
export class SubscriptionService implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.couponRepo.query(`
        CREATE TABLE IF NOT EXISTS \`coupons\` (
          \`id\` int unsigned NOT NULL AUTO_INCREMENT,
          \`code\` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`name\` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`description\` text COLLATE utf8mb4_unicode_ci,
          \`discount_type\` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`discount_value\` decimal(10,2) NOT NULL,
          \`currency\` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'BDT',
          \`valid_from\` datetime DEFAULT CURRENT_TIMESTAMP,
          \`valid_until\` datetime DEFAULT NULL,
          \`max_redemptions\` int DEFAULT NULL,
          \`redemption_count\` int DEFAULT '0',
          \`applies_to\` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'all',
          \`applicable_plans\` longtext COLLATE utf8mb4_unicode_ci,
          \`minimum_amount\` decimal(10,2) DEFAULT NULL,
          \`max_uses_per_company\` int DEFAULT '1',
          \`first_time_only\` tinyint(1) DEFAULT '0',
          \`is_active\` tinyint(1) DEFAULT '1',
          \`is_redeemable\` tinyint(1) DEFAULT '1',
          \`created_by\` int unsigned DEFAULT NULL,
          \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`) USING BTREE,
          UNIQUE KEY \`idx_coupons_code_unique\` (\`code\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (err) {
      console.warn('Could not auto-verify coupons table:', err);
    }
  }
  constructor(
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepo: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionInvoice)
    private readonly subscriptionInvoiceRepo: Repository<SubscriptionInvoice>,

    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,

    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    private readonly httpService: HttpService,
  ) {}

  //create or update subscription plan
  async createOrUpdateSubscriptionPlan(
    dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    if (
      dto.minUsers != null &&
      dto.maxUsers != null &&
      dto.minUsers > dto.maxUsers
    ) {
      throw new BadRequestException('minUsers cannot be greater than maxUsers');
    }

    if (dto.slug) {
      const existingSlug = await this.subscriptionPlanRepo.findOne({
        where: { slug: dto.slug },
      });
      if (existingSlug && existingSlug.id !== dto.id) {
        throw new ConflictException(
          `Subscription Plan with slug '${dto.slug}' already exists`,
        );
      }
    }

    if (dto.isPopular) {
      await this.subscriptionPlanRepo
        .createQueryBuilder()
        .update(SubscriptionPlan)
        .set({ isPopular: false })
        .where('id != :id', { id: dto.id || 0 })
        .execute();
    }

    if (dto.id) {
      const existing = await this.subscriptionPlanRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing) {
        throw new NotFoundException(
          `Subscription Plan with ID ${dto.id} not found`,
        );
      }
      const plan = this.subscriptionPlanRepo.merge(existing, dto);
      return await this.subscriptionPlanRepo.save(plan);
    } else {
      const plan = this.subscriptionPlanRepo.create(dto);
      return await this.subscriptionPlanRepo.save(plan);
    }
  }

  async findAllSubscriptionPlans(queryString: any): Promise<{
    data: SubscriptionPlan[];
    total: number;
  }> {
    const query = this.subscriptionPlanRepo.createQueryBuilder('plan');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    let params: any = {};
    if (queryString?.params) {
      try {
        params =
          typeof queryString.params === 'string'
            ? JSON.parse(queryString.params)
            : queryString.params;
      } catch {
        params = {};
      }
    }

    if (params.search) {
      query.andWhere(`plan.name LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findSubscriptionPlanById(id: number): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepo.findOne({ where: { id } });
    if (!plan)
      throw new NotFoundException(`Subscription Plan with ID ${id} not found`);
    return plan;
  }

  async deleteSubscriptionPlan(id: number): Promise<void> {
    try {
      const result = await this.subscriptionPlanRepo.delete(id);
      if (result.affected === 0)
        throw new NotFoundException(
          `Subscription Plan with ID ${id} not found`,
        );
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        throw new ConflictException(
          'Cannot delete this record because it is currently in use by other records.',
        );
      }
      throw error;
    }
  }

  // Change active status
  async changeSubscriptionPlanActiveStatus(id: number) {
    const findItem = await this.subscriptionPlanRepo.findOne({
      where: { id },
    });
    if (!findItem)
      throw new NotFoundException(`Subscription with ID ${id} not found`);

    findItem.isActive = !findItem.isActive;
    return this.subscriptionPlanRepo.save(findItem);
  }

  // Change popular status
  async changeSubscriptionPlanPopularStatus(id: number) {
    const findItem = await this.subscriptionPlanRepo.findOne({
      where: { id },
    });
    if (!findItem)
      throw new NotFoundException(`Subscription with ID ${id} not found`);

    const newStatus = !findItem.isPopular;

    if (newStatus) {
      await this.subscriptionPlanRepo
        .createQueryBuilder()
        .update(SubscriptionPlan)
        .set({ isPopular: false })
        .where('id != :id', { id })
        .execute();
    }

    findItem.isPopular = newStatus;
    return this.subscriptionPlanRepo.save(findItem);
  }

  async createOrUpdateSubscription(
    dto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    dto.userId = userId;
    dto.appId = appId;

    let subscription: Subscription;

    if (dto.id) {
      const existing = await this.subscriptionRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing)
        throw new NotFoundException(`Subscription with ID ${dto.id} not found`);
      subscription = this.subscriptionRepo.merge(existing, dto);
    } else {
      subscription = this.subscriptionRepo.create(dto);
    }
    subscription = await this.subscriptionRepo.save(subscription);
    return subscription;
  }

  async createSubscriptionForUser(
    userId: number,
    appId: number,
    planId: number,
    paymentMethod = 'manual',
    manager?: EntityManager,
    upgradeExisting = false,
    billingCycleOverride?: string | null,
  ): Promise<Subscription> {
    const targetRepo = manager
      ? manager.getRepository(Subscription)
      : this.subscriptionRepo;
    const targetPlanRepo = manager
      ? manager.getRepository(SubscriptionPlan)
      : this.subscriptionPlanRepo;
    const targetStatusRepo = manager
      ? manager.getRepository(Status)
      : this.statusRepository;

    const plan = await targetPlanRepo.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(
        `Subscription Plan with ID ${planId} not found`,
      );
    }
    if (!plan.isActive) {
      throw new BadRequestException(
        'The selected subscription plan is inactive',
      );
    }

    const activeStatus = await targetStatusRepo.findOne({
      where: { code: 'subscription_active' },
    });
    if (!activeStatus) {
      throw new NotFoundException('Subscription active status not found');
    }

    const now = new Date();
    const endDate = new Date(now);
    const billingCycle = String(
      billingCycleOverride ?? plan.billingCycle ?? 'Monthly',
    ).toLowerCase();
    if (billingCycle.includes('year')) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const existing = await targetRepo.findOne({
      where: { userId, appId },
      relations: ['status'],
    });
    if (existing) {
      const isTrial =
        existing.paymentMethod === 'trial' ||
        existing.statusId === 34 ||
        existing.status?.code === 'app_sub_status_trial';

      if (!upgradeExisting && !isTrial) {
        return existing;
      }

      existing.planId = planId;
      existing.startDate = now;
      existing.endDate = endDate;
      existing.statusId = activeStatus.id;
      existing.status = activeStatus;
      existing.paymentMethod = paymentMethod;
      existing.autoRenew = true;
      return targetRepo.save(existing);
    }

    const newSubscription = targetRepo.create({
      userId,
      appId,
      planId,
      startDate: now,
      endDate,
      statusId: activeStatus.id,
      status: activeStatus,
      paymentMethod,
      autoRenew: true,
    });

    return targetRepo.save(newSubscription);
  }

  async subscribe(dto: SubscribeDto): Promise<Subscription> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!userId || !appId) {
      throw new BadRequestException('Authenticated user context is required');
    }

    const appUser = await this.appUserRepo.findOne({
      where: { userId, appId },
    });
    if (!appUser) {
      throw new NotFoundException('Authenticated app user not found');
    }

    const plan = await this.subscriptionPlanRepo.findOne({
      where: { id: dto.planId },
    });
    if (!plan) {
      throw new NotFoundException(
        `Subscription Plan with ID ${dto.planId} not found`,
      );
    }
    if (!plan.isActive) {
      throw new BadRequestException(
        'The selected subscription plan is inactive',
      );
    }

    const status = await this.statusRepository.findOne({
      where: { id: dto.statusId },
    });
    if (!status) {
      throw new NotFoundException(`Status with ID ${dto.statusId} not found`);
    }
    if (status.isActive === false) {
      throw new BadRequestException(
        'The selected subscription status is inactive',
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const existing = await this.subscriptionRepo.findOne({
      where: { userId, appId },
    });
    if (existing) {
      throw new ConflictException('User already has a subscription');
    }

    const subscription = this.subscriptionRepo.create({
      ...dto,
      userId,
      appId,
      startDate,
      endDate,
    });
    const savedSubscription = await this.subscriptionRepo.save(subscription);
    return this.subscriptionRepo.findOneOrFail({
      where: { id: savedSubscription.id },
      relations: ['plan', 'status', 'user'],
    });
  }

  async findAllSubscriptions(
    queryString: any,
  ): Promise<{ data: Subscription[]; total: number }> {
    const query = this.subscriptionRepo.createQueryBuilder('subscription');
    query.leftJoin('subscription.user', 'user');
    query.leftJoin('subscription.status', 'status');

    query.addSelect([
      'user.firstName',
      'user.lastName',
      'status.name',
      'status.code',
      'status.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        'subscription.id LIKE :search OR subscription.paymentMethod LIKE :search',
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    const data = await query.getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Find subscription by ID
  async findSubscriptionById(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({ where: { id } });
    if (!subscription)
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    return subscription;
  }

  // Delete subscription by ID
  async deleteSubscription(id: number): Promise<void> {
    const result = await this.subscriptionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  // Create subscription invoice
  async createSubscriptionInvoice(
    dto: CreateSubscriptionInvoiceDto,
  ): Promise<SubscriptionInvoice> {
    const invoice = this.subscriptionInvoiceRepo.create(dto);

    // Generate a unique transactionId if not provided
    if (!dto.transactionId) {
      invoice.transactionId = `TXN-${uuidv4().split('-')[0].toUpperCase()}`;
    }

    return await this.subscriptionInvoiceRepo.save(invoice);
  }

  async findAllSubscriptionInvoices(queryString: any): Promise<{
    data: SubscriptionInvoice[];
    total: number;
  }> {
    const query = this.subscriptionInvoiceRepo.createQueryBuilder('invoice');

    query.leftJoin('invoice.subscription', 'subscription');
    query.leftJoin('invoice.status', 'status');
    query.leftJoin('subscription.user', 'user');

    query.addSelect([
      'subscription.userId',
      'subscription.planId',
      'status.name',
      'status.code',
      'user.firstName',
      'user.lastName',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`invoice.transactionId LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Get invoice by ID
  async findSubscriptionInvoiceById(id: number): Promise<SubscriptionInvoice> {
    const invoice = await this.subscriptionInvoiceRepo.findOne({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException(
        `Subscription Invoice with ID ${id} not found`,
      );
    }
    return invoice;
  }

  // Delete invoice
  async deleteSubscriptionInvoice(id: number): Promise<void> {
    const result = await this.subscriptionInvoiceRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Subscription Invoice with ID ${id} not found`,
      );
    }
  }

  async createOrUpdateCoupon(dto: CreateCouponDto): Promise<Coupon> {
    if (!dto.code) {
      dto.code = `OFFER-${uuidv4().split('-')[0].toUpperCase()}`;
    } else {
      dto.code = dto.code.trim().toUpperCase();
    }

    if (!dto.currency) {
      dto.currency = 'BDT';
    }

    // Check code uniqueness
    const conflict = await this.couponRepo.findOne({
      where: { code: dto.code },
    });
    if (conflict && (!dto.id || conflict.id !== dto.id)) {
      throw new BadRequestException(
        `Coupon code "${dto.code}" is already in use`,
      );
    }

    dto.createdBy = RequestContext.get('userId');

    let coupon: Coupon;

    if (dto.id) {
      const existing = await this.couponRepo.findOne({ where: { id: dto.id } });
      if (!existing)
        throw new NotFoundException(`Coupon with ID ${dto.id} not found`);
      coupon = this.couponRepo.merge(existing, dto);
    } else {
      coupon = this.couponRepo.create(dto);
    }

    return await this.couponRepo.save(coupon);
  }

  // Get all coupons with pagination, search, sort
  async findAllCoupons(
    queryString: any,
  ): Promise<{ data: Coupon[]; total: number }> {
    const query = this.couponRepo.createQueryBuilder('coupon');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere('(coupon.name LIKE :search OR coupon.code LIKE :search)', {
        search,
      });
    }

    if (params.status !== undefined && params.status !== '') {
      if (params.status === 'active') {
        query.andWhere('coupon.is_active = 1');
      } else if (params.status === 'inactive') {
        query.andWhere('coupon.is_active = 0');
      } else if (params.status === 'expired') {
        query.andWhere(
          'coupon.valid_until IS NOT NULL AND coupon.valid_until < NOW()',
        );
      }
    }

    if (params.discountType) {
      query.andWhere('coupon.discount_type = :discountType', {
        discountType: params.discountType,
      });
    }

    query.orderBy('coupon.id', 'DESC');

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Get coupon by ID
  async findCouponById(id: number): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);
    return coupon;
  }

  // Toggle active status
  async toggleCouponStatus(id: number): Promise<Coupon> {
    const coupon = await this.findCouponById(id);
    coupon.isActive = !coupon.isActive;
    return await this.couponRepo.save(coupon);
  }

  // Validate coupon against plan
  async validateCoupon(
    code: string,
    planId?: number,
    billingCycle?: string,
  ): Promise<{
    isValid: boolean;
    message: string;
    coupon?: Coupon;
    discountType?: string;
    discountValue?: number;
  }> {
    if (!code) {
      return { isValid: false, message: 'Coupon code is required' };
    }
    const cleanCode = code.trim().toUpperCase();
    const coupon = await this.couponRepo.findOne({
      where: { code: cleanCode },
    });
    if (!coupon) {
      return { isValid: false, message: 'Invalid coupon code' };
    }
    if (!coupon.isActive || !coupon.isRedeemable) {
      return { isValid: false, message: 'This coupon is currently inactive' };
    }
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return {
        isValid: false,
        message: 'This coupon offer has not started yet',
      };
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { isValid: false, message: 'This coupon has expired' };
    }
    if (
      coupon.maxRedemptions != null &&
      coupon.redemptionCount != null &&
      coupon.redemptionCount >= coupon.maxRedemptions
    ) {
      return {
        isValid: false,
        message: 'This coupon has reached its maximum redemption limit',
      };
    }
    if (
      planId &&
      coupon.appliesTo === 'specific_plans' &&
      Array.isArray(coupon.applicablePlans) &&
      coupon.applicablePlans.length > 0
    ) {
      if (!coupon.applicablePlans.includes(Number(planId))) {
        return {
          isValid: false,
          message: 'This coupon is not applicable to the selected plan',
        };
      }
    }
    return {
      isValid: true,
      message: 'Coupon applied successfully',
      coupon,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    };
  }

  // Delete coupon by ID
  async deleteCoupon(id: number): Promise<void> {
    const result = await this.couponRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Coupon with ID ${id} not found`);
  }

  async findAllActiveSubscriptionPlans(
    queryString: any,
  ): Promise<{ data: SubscriptionPlan[]; total: number }> {
    const query = this.subscriptionPlanRepo.createQueryBuilder('plan');

    query.select([
      'plan.id',
      'plan.name',
      'plan.slug',
      'plan.description',
      'plan.monthlyPrice',
      'plan.yearlyPrice',
      'plan.currency',
      'plan.features',
      'plan.minUsers',
      'plan.maxUsers',
      'plan.billingCycle',
      'plan.trialDays',
      'plan.sortOrder',
      'plan.isPopular',
    ]);
    query.where('plan.isActive = :isActive', { isActive: 1 });
    query.orderBy('plan.sortOrder', 'ASC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        '(plan.name LIKE :search OR plan.description LIKE :search)',
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    const data = await query.getMany();
    const total = await query.getCount();

    return {
      data,
      total,
    };
  }

  private async generateInvoiceNumber(
    appId: number,
    manager?: EntityManager,
  ): Promise<string> {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const repo = manager ? manager.getRepository(Invoice) : this.invoiceRepo;

    const findOptions: any = {
      where: appId ? { appId } : {},
      order: { id: 'DESC' },
    };
    if (manager) {
      findOptions.lock = { mode: 'pessimistic_write' };
    }

    const last = await repo.findOne(findOptions);

    const sequence = ((last?.id ?? 0) + 1).toString().padStart(6, '0');

    return `APP${appId || '1'}-${datePart}-${sequence}`;
  }

  async createOrUpdateInvoice(dto: CreateInvoiceDto): Promise<any> {
    const activeAppId = RequestContext.get('activeAppId');
    const authUserId = RequestContext.get('userId');

    if (dto.appId === undefined || dto.appId === null) {
      dto.appId = activeAppId;
    }

    if (dto.userId === undefined) {
      dto.userId = authUserId ?? null;
    }

    if (dto.id) {
      const existing = await this.invoiceRepo.findOne({
        where: { id: dto.id },
      });

      if (!existing) {
        throw new NotFoundException(`Invoice ${dto.id} not found`);
      }

      const isPaid =
        dto.paymentStatus?.toLowerCase() === 'paid' ||
        dto.status?.toLowerCase() === 'paid';
      if (isPaid && !existing.paidAt && !dto.paidAt) {
        dto.paidAt = new Date();
      }

      const updated = this.invoiceRepo.merge(existing, dto as any);
      const result = await this.invoiceRepo.save(updated);

      return result;
    }

    const invoiceNumber =
      dto.invoiceNumber ||
      (await this.generateInvoiceNumber(dto.appId || activeAppId));

    let paidAt = dto.paidAt;
    const isPaid =
      dto.paymentStatus?.toLowerCase() === 'paid' ||
      dto.status?.toLowerCase() === 'paid';
    if (isPaid && !paidAt) {
      paidAt = new Date();
    }

    const { id, ...createFields } = dto;
    const payload = {
      ...createFields,
      paidAt,
      invoiceNumber,
      status: (dto.status as string) || 'draft',
    };

    const invoice = this.invoiceRepo.create(payload as any);

    const result = await this.invoiceRepo.save(invoice);

    return result;
  }

  async findInvoiceById(id: number, ignoreUserScope = false): Promise<Invoice> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const query = this.invoiceRepo.createQueryBuilder('invoice');
    query.leftJoinAndSelect('invoice.user', 'user');
    query.leftJoinAndSelect('invoice.subscription', 'subscription');
    query.leftJoinAndSelect('subscription.plan', 'plan');
    query.leftJoinAndSelect(
      'invoice.paymentTransactions',
      'paymentTransactions',
    );
    query.leftJoinAndSelect(
      'paymentTransactions.subscriptionPlan',
      'paymentPlan',
    );

    query.where('invoice.id = :id', { id });
    if (userId && !ignoreUserScope) {
      query.andWhere('invoice.userId = :userId', { userId });
    }
    if (appId) query.andWhere('invoice.appId = :appId', { appId });

    const invoice = await query.getOne();

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async deleteInvoiceById(id: number): Promise<void> {
    const activeAppId = RequestContext.get('activeAppId');
    const whereClause: any = { id };
    if (activeAppId) {
      whereClause.appId = activeAppId;
    }
    const invoice = await this.invoiceRepo.findOne({ where: whereClause });
    if (!invoice) {
      return;
    }
    await this.invoiceRepo.delete(id);
  }

  async getInvoicePdfBuffer(invoice: Invoice): Promise<Buffer> {
    if (invoice.pdfUrl) {
      try {
        return await this.fetchInvoicePdfFromUrl(invoice.pdfUrl);
      } catch (error) {
        console.error(
          'Failed to fetch remote invoice PDF, falling back to generation:',
          error,
        );
      }
    }

    return this.generateInvoicePdf(invoice);
  }

  async fetchInvoicePdfFromUrl(pdfUrl: string): Promise<Buffer> {
    if (!pdfUrl) {
      throw new BadRequestException('PDF URL is required');
    }

    const response = await firstValueFrom(
      this.httpService.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 400,
      }),
    );

    const data = response.data;

    if (!data || data.byteLength === 0) {
      throw new Error('Remote PDF is empty');
    }

    return Buffer.isBuffer(data) ? data : Buffer.from(data);
  }

  async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    const invoiceNumber =
      invoice.invoiceNumber ?? `INV-${invoice.id ?? 'unknown'}`;
    const customerName = invoice.user
      ? `${invoice.user.firstName ?? ''} ${invoice.user.lastName ?? ''}`.trim() ||
        'Customer'
      : 'Customer';
    const customerEmail = invoice.user?.email ?? '';

    const transaction =
      invoice.paymentTransactions?.find(
        (payment) => payment.invoiceId === invoice.id,
      ) ?? invoice.paymentTransactions?.[0];
    const plan = transaction?.subscriptionPlan ?? invoice.subscription?.plan;
    const planName = plan?.name ?? 'Subscription';
    const billingCycle = plan?.billingCycle ?? '';
    const invoiceDate = (
      invoice.createdAt ? new Date(invoice.createdAt) : new Date()
    ).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const subtotal = Number(invoice.subtotal ?? invoice.totalAmount ?? 0);
    const discount = Number(invoice.discountAmount ?? 0);
    const vat = Number(invoice.taxAmount ?? 0);
    const total = Number(invoice.totalAmount ?? subtotal + vat - discount);
    const isPaid =
      String(invoice.paymentStatus ?? '').toLowerCase() === 'paid' ||
      String(invoice.status ?? '').toLowerCase() === 'paid';
    const amountPaid = isPaid ? total : 0;
    const balanceDue = isPaid ? 0 : total;

    const currencySymbol = `${invoice.currency || 'BDT'} `;
    const money = (n: number) =>
      `${currencySymbol}${Number(n).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const detailsBlock = plan
      ? [
          'SUBSCRIPTION',
          `Plan: ${planName}`,
          `Billing Cycle: ${billingCycle}`,
          `Period: ${invoiceDate} - ${new Date(new Date(invoice.createdAt ?? Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
          '',
        ]
      : [
          'INVOICE DETAILS',
          `Type: Standard Invoice`,
          `Currency: ${invoice.currency || 'BDT'}`,
          '',
        ];

    const paymentBlock = transaction
      ? [
          'PAYMENT',
          `Method: ${transaction?.paymentMethod || transaction?.gateway || 'Online'}`,
          `Transaction ID: ${transaction?.tranId || '-'}`,
          `Payment Date: ${invoiceDate}`,
          '',
        ]
      : [
          'PAYMENT',
          `Status: ${isPaid ? 'PAID' : invoice.paymentStatus?.toUpperCase() || invoice.status?.toUpperCase() || 'UNPAID'}`,
          `Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}`,
          '',
        ];

    const lines = [
      'INVOICE',
      '',
      `Invoice No: ${invoiceNumber}`,
      `Invoice Date: ${invoiceDate}`,
      `Status: ${invoice.paymentStatus?.toUpperCase() || invoice.status?.toUpperCase() || (isPaid ? 'PAID' : 'UNPAID')}`,
      '',
      'BILLED TO',
      `Name: ${customerName}`,
      `Email: ${customerEmail}`,
      '',
      ...detailsBlock,
      ...paymentBlock,
      `${(plan ? planName : 'Subtotal').padEnd(20, ' ').slice(0, 20)} ${money(subtotal)}`,
      `Discount            ${money(discount)}`,
      `Subtotal            ${money(subtotal)}`,
      `VAT                 ${money(vat)}`,
      '--------------------------------',
      `TOTAL             ${money(total)}`,
      `Amount Paid       ${money(amountPaid)}`,
      `Balance Due       ${money(balanceDue)}`,
      '',
      'Thank you for your business.',
    ];

    const contentStream = lines
      .map((line, index) => {
        const escaped = line
          .replace(/[^\x20-\x7E]/g, ' ')
          .replace(/\\/g, '\\\\')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)');

        return `BT\n/F1 10 Tf\n50 ${800 - index * 18} Td\n(${escaped}) Tj\nET`;
      })
      .join('\n');

    const objects: string[] = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      `<< /Length ${Buffer.byteLength(contentStream, 'latin1')} >>\nstream\n${contentStream}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];

    objects.forEach((obj, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'latin1');
  }

  async findAllInvoices(
    queryString: any,
    enforceUserScope = false,
  ): Promise<{
    data: Invoice[];
    total: number;
  }> {
    const query = this.invoiceRepo.createQueryBuilder('invoice');

    query.leftJoinAndSelect('invoice.subscription', 'subscription');
    query.leftJoinAndSelect('subscription.plan', 'plan');
    query.leftJoinAndSelect(
      'invoice.paymentTransactions',
      'paymentTransaction',
    );
    query.leftJoinAndSelect(
      'paymentTransaction.subscriptionPlan',
      'paymentPlan',
    );
    query.leftJoinAndSelect(
      'paymentTransaction.subscription',
      'paymentSubscription',
    );
    query.leftJoin('invoice.user', 'user');
    query.leftJoin('invoice.application', 'application');
    query.leftJoin('invoice.coupon', 'coupon');
    //query.leftJoin('invoice.status', 'status');

    query.addSelect([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',

      'coupon.id',
      'coupon.code',
      'coupon.name',
      'coupon.description',
      'coupon.currency',
      'coupon.discountType',
      'coupon.discountValue',
      'coupon.validFrom',
      'coupon.validUntil',

      // 'status.name',
      // 'status.code',
      // 'status.colorName',
    ]);

    const activeAppId = RequestContext.get('activeAppId');
    if (activeAppId) {
      query.andWhere('invoice.appId = :appId', { appId: activeAppId });
    }
    if (enforceUserScope) {
      const userId = RequestContext.get('userId');
      if (userId) {
        query.andWhere('invoice.userId = :userId', { userId });
      }
    }

    let params: Record<string, any> = {};
    if (queryString?.params) {
      try {
        params =
          typeof queryString.params === 'string'
            ? JSON.parse(queryString.params)
            : queryString.params;
      } catch (error) {
        console.error('Invalid JSON in params:', error);
      }
    }

    if (params.search) {
      const searchVal = String(params.search).trim();
      query.andWhere(
        `(invoice.invoiceNumber LIKE :search 
        OR invoice.stripeInvoiceId LIKE :search 
        OR invoice.stripePaymentIntentId LIKE :search
        OR paymentTransaction.tranId LIKE :search
        OR user.firstName LIKE :search 
        OR user.lastName LIKE :search)`,
        {
          search: `%${searchVal}%`,
        },
      );
    }

    if (params.invoiceNo) {
      const invoiceNoVal = String(params.invoiceNo).trim();
      query.andWhere(
        `(invoice.invoiceNumber LIKE :invoiceNo OR invoice.stripeInvoiceId LIKE :invoiceNo)`,
        {
          invoiceNo: `%${invoiceNoVal}%`,
        },
      );
    }

    if (params.transactionId) {
      const tranVal = String(params.transactionId).trim();
      query.andWhere(
        `(paymentTransaction.tranId LIKE :transactionId OR invoice.stripePaymentIntentId LIKE :transactionId)`,
        {
          transactionId: `%${tranVal}%`,
        },
      );
    }

    if (params.paymentStatus) {
      query.andWhere('LOWER(invoice.paymentStatus) = :paymentStatus', {
        paymentStatus: String(params.paymentStatus).trim().toLowerCase(),
      });
    }

    if (params.startDate && params.endDate) {
      query.andWhere(
        'DATE(invoice.paid_at) >= :startDate AND DATE(invoice.paid_at) <= :endDate',
        {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      );
    } else if (params.startDate) {
      query.andWhere('DATE(invoice.paid_at) >= :startDate', {
        startDate: params.startDate,
      });
    } else if (params.endDate) {
      query.andWhere('DATE(invoice.paid_at) <= :endDate', {
        endDate: params.endDate,
      });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    data.forEach((invoice: any) => {
      const transaction =
        invoice.paymentTransactions?.find(
          (payment: any) => payment.invoiceId === invoice.id,
        ) ??
        invoice.paymentTransactions?.[0] ??
        null;
      const plan =
        transaction?.subscriptionPlan ?? invoice.subscription?.plan ?? null;

      invoice.plan = plan;
      invoice.planName = plan?.name ?? null;
      invoice.subscriptionPlan = plan;
      invoice.transactionId =
        transaction?.tranId ?? invoice.stripePaymentIntentId ?? null;
      const activeFrom =
        invoice.paidAt ?? transaction?.createdAt ?? invoice.createdAt ?? null;
      const activeTo = activeFrom ? new Date(activeFrom) : null;
      if (activeTo) {
        if (
          String(plan?.billingCycle ?? '')
            .toLowerCase()
            .includes('year')
        ) {
          activeTo.setFullYear(activeTo.getFullYear() + 1);
        } else {
          activeTo.setMonth(activeTo.getMonth() + 1);
        }
      }
      invoice.activeFrom = activeFrom;
      invoice.activeTo = activeTo;
      invoice.subscriptionStartDate = invoice.activeFrom;
      invoice.subscriptionEndDate = invoice.activeTo;
      invoice.billingPeriodStart = invoice.activeFrom;
      invoice.billingPeriodEnd = invoice.activeTo;

      if (invoice.user) {
        const fullName =
          `${invoice.user.firstName ?? ''} ${invoice.user.lastName ?? ''}`.trim();
        invoice.clientName = fullName || invoice.user.email || null;
        invoice.customerName = invoice.clientName;
        invoice.customerEmail = invoice.user.email ?? null;
        invoice.customerPhone = null;
      }
      if (typeof invoice.invoiceItems === 'string') {
        try {
          invoice.parsedInvoiceItems = JSON.parse(invoice.invoiceItems);
        } catch {
          invoice.parsedInvoiceItems = null;
        }
      } else if (Array.isArray(invoice.invoiceItems)) {
        invoice.parsedInvoiceItems = invoice.invoiceItems;
      }
    });
    const total = await query.getCount();

    return { data, total };
  }

  async getCurrentCompanySubscription(): Promise<any> {
    const authUserId = RequestContext.get('userId');
    let activeAppId = RequestContext.get('activeAppId');

    if (!activeAppId && authUserId) {
      const user = await this.appUserRepo.findOne({
        where: { userId: authUserId },
      });
      activeAppId = user?.appId ?? null;
    }

    if (!activeAppId && !authUserId) {
      return {
        hasSubscription: false,
        subscription: null,
        plan: null,
        isTrial: false,
        isPurchased: false,
        isExpired: false,
        daysRemaining: 0,
      };
    }

    let subscription: Subscription | null = null;
    if (activeAppId) {
      subscription = await this.subscriptionRepo.findOne({
        where: { appId: activeAppId },
        relations: ['plan', 'status'],
        order: { id: 'DESC' },
      });
    }

    if (!subscription && authUserId) {
      subscription = await this.subscriptionRepo.findOne({
        where: { userId: authUserId },
        relations: ['plan', 'status'],
        order: { id: 'DESC' },
      });
    }

    if (!subscription) {
      return {
        hasSubscription: false,
        subscription: null,
        plan: null,
        isTrial: false,
        isPurchased: false,
        isExpired: false,
        daysRemaining: 0,
      };
    }

    const paidInvoice = await this.invoiceRepo.findOne({
      where: [
        { subscriptionId: subscription.id, paymentStatus: PaymentStatus.PAID },
        { subscriptionId: subscription.id, status: 'paid' },
        ...(subscription.appId
          ? [{ appId: subscription.appId, paymentStatus: PaymentStatus.PAID }]
          : []),
      ],
      order: { id: 'DESC' },
    });

    const paidSubInvoice = await this.subscriptionInvoiceRepo.findOne({
      where: [
        { subscriptionId: subscription.id, statusId: 38 },
        { subscriptionId: subscription.id, paidAt: Not(IsNull()) },
      ],
      order: { id: 'DESC' },
    });

    const isTrial =
      subscription.paymentMethod === 'trial' ||
      subscription.statusId === 34 ||
      subscription.status?.code === 'app_sub_status_trial';

    const hasPaidInvoice = Boolean(paidInvoice || paidSubInvoice);
    const isPurchased = Boolean(hasPaidInvoice);

    let daysRemaining = 0;
    let isExpired = false;

    if (subscription.endDate) {
      const msDiff = new Date(subscription.endDate).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
      isExpired = msDiff <= 0;
    }

    return {
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        appId: subscription.appId,
        userId: subscription.userId,
        planId: subscription.planId,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        paymentMethod: subscription.paymentMethod,
        autoRenew: subscription.autoRenew,
        statusId: subscription.statusId,
        statusCode: subscription.status?.code ?? null,
        statusName: subscription.status?.name ?? null,
      },
      plan: subscription.plan
        ? {
            id: subscription.plan.id,
            name: subscription.plan.name,
            description: subscription.plan.description,
            price: subscription.plan.monthlyPrice,
            monthlyPrice: subscription.plan.monthlyPrice,
            yearlyPrice: subscription.plan.yearlyPrice,
            perUserYearlyPrice: subscription.plan.perUserYearlyPrice,
            billingCycle: subscription.plan.billingCycle,
            minUsers: subscription.plan.minUsers,
            maxUsers: subscription.plan.maxUsers,
            trialDays: subscription.plan.trialDays,
            features: subscription.plan.features,
            currency: subscription.plan.currency,
          }
        : null,
      isTrial,
      isPurchased,
      isExpired,
      daysRemaining,
      trialEndDate: subscription.endDate,
      invoice: paidInvoice
        ? {
            id: paidInvoice.id,
            invoiceNumber: paidInvoice.invoiceNumber,
            totalAmount: paidInvoice.totalAmount,
            paidAt: paidInvoice.paidAt,
            paymentStatus: paidInvoice.paymentStatus,
          }
        : paidSubInvoice
          ? {
              id: paidSubInvoice.id,
              invoiceNumber: `SUB-INV-${paidSubInvoice.id}`,
              totalAmount: paidSubInvoice.amount,
              paidAt: paidSubInvoice.paidAt,
              paymentStatus: 'paid',
            }
          : null,
    };
  }

  async getSubscriberCompanies(queryString: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    planType?: string;
    status?: string;
    subscriptionStatus?: string;
    statusId?: number | string;
    companyStatus?: string;
    params?:
      | string
      | {
          search?: string;
          planType?: string;
          status?: string;
          subscriptionStatus?: string;
          statusId?: number | string;
          companyStatus?: string;
        };
  }) {
    const page = Math.max(1, Number(queryString?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(queryString?.limit) || 10));
    const offset = (page - 1) * limit;

    let search = '';
    let planType = 'all';
    let statusFilter = 'all';
    let subStatusFilter = 'all';
    let companyStatusFilter = 'all';

    if (queryString?.params) {
      try {
        const parsed: SubscriberQueryParams =
          typeof queryString.params === 'string'
            ? (JSON.parse(queryString.params) as SubscriberQueryParams)
            : queryString.params;
        if (parsed?.search) search = String(parsed.search).trim();
        if (parsed?.planType)
          planType = String(parsed.planType).toLowerCase().trim();
        if (parsed?.status)
          statusFilter = String(parsed.status).toLowerCase().trim();
        if (parsed?.subscriptionStatus)
          subStatusFilter = String(parsed.subscriptionStatus)
            .toLowerCase()
            .trim();
        if (parsed?.statusId != null && parsed.statusId !== '')
          subStatusFilter = String(parsed.statusId).toLowerCase().trim();
        if (parsed?.companyStatus)
          companyStatusFilter = String(parsed.companyStatus)
            .toLowerCase()
            .trim();
      } catch {
        // Fallback
      }
    }
    if (queryString?.search) search = String(queryString.search).trim();
    if (queryString?.planType)
      planType = String(queryString.planType).toLowerCase().trim();
    if (queryString?.status)
      statusFilter = String(queryString.status).toLowerCase().trim();
    if (queryString?.subscriptionStatus)
      subStatusFilter = String(queryString.subscriptionStatus)
        .toLowerCase()
        .trim();
    if (queryString?.statusId != null && queryString.statusId !== '')
      subStatusFilter = String(queryString.statusId).toLowerCase().trim();
    if (queryString?.companyStatus)
      companyStatusFilter = String(queryString.companyStatus)
        .toLowerCase()
        .trim();

    // Map statusFilter to subStatusFilter if statusFilter matches status_group_id = 6 values
    if (subStatusFilter === 'all') {
      if (
        statusFilter === '30' ||
        statusFilter === 'active_sub' ||
        statusFilter === 'app_sub_status_active'
      ) {
        subStatusFilter = '30';
      } else if (
        statusFilter === '34' ||
        statusFilter === 'trial' ||
        statusFilter === 'app_sub_status_trial'
      ) {
        subStatusFilter = '34';
      } else if (
        statusFilter === '32' ||
        statusFilter === 'expired' ||
        statusFilter === 'app_sub_status_expired'
      ) {
        subStatusFilter = '32';
      } else if (
        statusFilter === '33' ||
        statusFilter === 'canceled' ||
        statusFilter === 'app_sub_status_canceled'
      ) {
        subStatusFilter = '33';
      } else if (statusFilter === 'active' && companyStatusFilter === 'all') {
        companyStatusFilter = 'active';
      } else if (statusFilter === 'inactive' && companyStatusFilter === 'all') {
        companyStatusFilter = 'inactive';
      }
    }

    const whereConditions: string[] = ['a.deleted_at IS NULL'];
    const queryParams: (string | number)[] = [];

    if (search) {
      whereConditions.push(`(
        a.name LIKE ?
        OR a.email LIKE ?
        OR a.phone LIKE ?
        OR EXISTS (
          SELECT 1 FROM app_users au2
          JOIN users u2 ON u2.id = au2.user_id
          WHERE au2.app_id = a.id
            AND (
              u2.first_name LIKE ?
              OR u2.last_name LIKE ?
              OR u2.email LIKE ?
              OR CONCAT(COALESCE(u2.first_name, ''), ' ', COALESCE(u2.last_name, '')) LIKE ?
            )
        )
      )`);
      const s = `%${search}%`;
      queryParams.push(s, s, s, s, s, s, s);
    }

    if (companyStatusFilter === 'active') {
      whereConditions.push('a.is_active = 1');
    } else if (companyStatusFilter === 'inactive') {
      whereConditions.push('a.is_active = 0');
    }

    // Filter by Subscription Status (status_group_id = 6)
    if (subStatusFilter !== 'all' && subStatusFilter !== '') {
      if (
        subStatusFilter === '30' ||
        subStatusFilter === 'active' ||
        subStatusFilter === 'app_sub_status_active'
      ) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM subscriptions s2
          WHERE s2.app_id = a.id
            AND (
              EXISTS (
                SELECT 1 FROM invoices i
                WHERE (i.subscription_id = s2.id OR i.app_id = a.id)
                  AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
              )
              OR EXISTS (
                SELECT 1 FROM subscription_invoices si
                WHERE si.subscription_id = s2.id
                  AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
              )
            )
        )`);
      } else if (
        subStatusFilter === '34' ||
        subStatusFilter === 'trial' ||
        subStatusFilter === 'app_sub_status_trial'
      ) {
        // "free means e trail": covers companies without paid subscription
        whereConditions.push(`(
          NOT EXISTS (SELECT 1 FROM subscriptions s2 WHERE s2.app_id = a.id)
          OR (
            EXISTS (
              SELECT 1 FROM subscriptions s2
              WHERE s2.app_id = a.id
                AND (s2.status_id = 34 OR s2.payment_method = 'trial')
            )
            AND NOT EXISTS (
              SELECT 1 FROM invoices i
              WHERE i.app_id = a.id
                AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
            )
            AND NOT EXISTS (
              SELECT 1 FROM subscription_invoices si
              JOIN subscriptions s3 ON s3.id = si.subscription_id
              WHERE s3.app_id = a.id
                AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
            )
          )
        )`);
      } else if (
        subStatusFilter === '32' ||
        subStatusFilter === 'expired' ||
        subStatusFilter === 'app_sub_status_expired'
      ) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM subscriptions s2
          WHERE s2.app_id = a.id AND s2.status_id = 32
        )`);
      } else if (
        subStatusFilter === '33' ||
        subStatusFilter === 'canceled' ||
        subStatusFilter === 'app_sub_status_canceled'
      ) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM subscriptions s2
          WHERE s2.app_id = a.id AND s2.status_id = 33
        )`);
      }
    }

    if (planType && planType !== 'all') {
      if (
        planType === 'purchased' ||
        planType === 'packages' ||
        planType === 'package' ||
        planType === 'premium'
      ) {
        // Only purchased packages
        whereConditions.push(`EXISTS (
          SELECT 1 FROM subscriptions s2
          WHERE s2.app_id = a.id
            AND (
              EXISTS (
                SELECT 1 FROM invoices i
                WHERE (i.subscription_id = s2.id OR i.app_id = a.id)
                  AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
              )
              OR EXISTS (
                SELECT 1 FROM subscription_invoices si
                WHERE si.subscription_id = s2.id
                  AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
              )
            )
        )`);
      } else if (planType === 'trial' || planType === 'free') {
        // "free ta remove kore free er jaygay trail diba free means e trail"
        whereConditions.push(`NOT EXISTS (
          SELECT 1 FROM subscriptions s2
          WHERE s2.app_id = a.id
            AND (
              EXISTS (
                SELECT 1 FROM invoices i
                WHERE (i.subscription_id = s2.id OR i.app_id = a.id)
                  AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
              )
              OR EXISTS (
                SELECT 1 FROM subscription_invoices si
                WHERE si.subscription_id = s2.id
                  AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
              )
            )
        )`);
      } else {
        // Specific plan slug, name, or plan ID (e.g. 'growth', 'enterprise', 'starter-plan')
        // Only paid companies qualify for package tiers
        whereConditions.push(`EXISTS (
          SELECT 1 FROM subscriptions s2
          JOIN subscription_plans sp2 ON sp2.id = s2.plan_id
          WHERE s2.app_id = a.id
            AND (
              EXISTS (
                SELECT 1 FROM invoices i
                WHERE (i.subscription_id = s2.id OR i.app_id = a.id)
                  AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
              )
              OR EXISTS (
                SELECT 1 FROM subscription_invoices si
                WHERE si.subscription_id = s2.id
                  AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
              )
            )
            AND (
              sp2.slug = ?
              OR LOWER(sp2.name) = ?
              OR LOWER(sp2.name) LIKE ?
              OR CAST(sp2.id AS CHAR) = ?
            )
        )`);
        queryParams.push(planType, planType, `%${planType}%`, planType);
      }
    }

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM applications a
      ${whereClause}
    `;

    const countRes = await this.subscriptionRepo.query<
      Array<{ total: number | string }>
    >(countSql, queryParams);
    const total = Number(countRes?.[0]?.total || 0);

    const dataSql = `
      SELECT
        a.id,
        a.name,
        a.email,
        a.phone,
        a.address,
        a.website_url AS websiteUrl,
        a.facebook_url AS facebookUrl,
        a.linked_in_url AS linkedinUrl,
        c_type.name AS typeName,
        c_size.name AS sizeName,
        a.is_active AS isActive,
        a.created_at AS createdAt,
        m.folder_path AS logoFolderPath,
        m.filename AS logoFilename,
        (
          SELECT JSON_OBJECT(
            'id', s.id,
            'planId', s.plan_id,
            'planName', p.name,
            'planSlug', p.slug,
            'description', p.description,
            'currency', p.currency,
            'monthlyPrice', p.monthly_price,
            'yearlyPrice', p.yearly_price,
            'startDate', s.start_date,
            'endDate', s.end_date,
            'statusId', s.status_id,
            'statusCode', st.code,
            'statusName', st.name,
            'paymentMethod', s.payment_method,
            'autoRenew', s.auto_renew,
            'trialDays', p.trial_days,
            'minUsers', p.min_users,
            'maxUsers', p.max_users
          )
          FROM subscriptions s
          LEFT JOIN subscription_plans p ON p.id = s.plan_id
          LEFT JOIN statuses st ON st.id = s.status_id
          WHERE s.app_id = a.id
          ORDER BY s.id DESC
          LIMIT 1
        ) AS subscription,
        (
          SELECT JSON_OBJECT(
            'id', inv.id,
            'invoiceNumber', inv.invoice_number,
            'totalAmount', inv.total_amount,
            'status', inv.status,
            'paymentStatus', inv.payment_status,
            'paidAt', inv.paid_at,
            'dueDate', inv.due_date,
            'createdAt', inv.created_at
          )
          FROM invoices inv
          WHERE inv.app_id = a.id
          ORDER BY inv.id DESC
          LIMIT 1
        ) AS latestInvoice,
        (
          SELECT JSON_OBJECT(
            'id', si.id,
            'amount', si.amount,
            'statusId', si.status_id,
            'statusName', st_si.name,
            'statusCode', st_si.code,
            'paidAt', si.paid_at,
            'transactionId', si.transaction_id,
            'dueDate', si.due_date
          )
          FROM subscription_invoices si
          JOIN subscriptions s_si ON s_si.id = si.subscription_id
          LEFT JOIN statuses st_si ON st_si.id = si.status_id
          WHERE s_si.app_id = a.id
          ORDER BY si.id DESC
          LIMIT 1
        ) AS latestSubscriptionInvoice,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', inv.id,
              'invoiceNumber', inv.invoice_number,
              'totalAmount', inv.total_amount,
              'currency', COALESCE(inv.currency, 'BDT'),
              'status', inv.status,
              'paymentStatus', inv.payment_status,
              'paidAt', inv.paid_at,
              'dueDate', inv.due_date,
              'createdAt', inv.created_at,
              'billingPeriodStart', inv.billing_period_start,
              'billingPeriodEnd', inv.billing_period_end,
              'planName', COALESCE(
                (
                  SELECT sp.name FROM payment_transactions pt
                  JOIN subscription_plans sp ON sp.id = pt.subscription_plan_id
                  WHERE pt.invoice_id = inv.id
                  ORDER BY pt.id DESC LIMIT 1
                ),
                (
                  SELECT sp2.name FROM subscriptions s2
                  JOIN subscription_plans sp2 ON sp2.id = s2.plan_id
                  WHERE s2.id = inv.subscription_id LIMIT 1
                )
              ),
              'transactionId', (
                SELECT pt2.tran_id FROM payment_transactions pt2
                WHERE pt2.invoice_id = inv.id
                ORDER BY pt2.id DESC LIMIT 1
              ),
              'paymentMethod', (
                SELECT pt3.payment_method FROM payment_transactions pt3
                WHERE pt3.invoice_id = inv.id
                ORDER BY pt3.id DESC LIMIT 1
              ),
              'gateway', (
                SELECT pt4.gateway FROM payment_transactions pt4
                WHERE pt4.invoice_id = inv.id
                ORDER BY pt4.id DESC LIMIT 1
              )
            )
          )
          FROM invoices inv
          WHERE inv.app_id = a.id
        ) AS purchaseHistory,
        COALESCE((SELECT COUNT(*) FROM app_users au WHERE au.app_id = a.id), 0) AS totalUsers,
        COALESCE((SELECT COUNT(*) FROM app_users au WHERE au.app_id = a.id AND au.is_active = 1), 0) AS activeUsers,
        COALESCE(
          (
            SELECT JSON_OBJECT(
              'id', u.id,
              'name', TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))),
              'email', u.email,
              'phone', COALESCE(uci.mobile_personal, uci.mobile_work, a.phone)
            )
            FROM app_users au
            JOIN users u ON u.id = au.user_id
            LEFT JOIN user_contact_infos uci ON uci.user_id = u.id
            WHERE au.app_id = a.id
            ORDER BY au.id ASC
            LIMIT 1
          ),
          (
            SELECT JSON_OBJECT(
              'id', u2.id,
              'name', TRIM(CONCAT(COALESCE(u2.first_name, ''), ' ', COALESCE(u2.last_name, ''))),
              'email', u2.email,
              'phone', COALESCE(uci2.mobile_personal, uci2.mobile_work, a.phone)
            )
            FROM users u2
            LEFT JOIN user_contact_infos uci2 ON uci2.user_id = u2.id
            WHERE u2.id = a.created_by
            LIMIT 1
          )
        ) AS owner
      FROM applications a
      LEFT JOIN aws_media m ON m.id = a.logo_media_id
      LEFT JOIN statuses c_type ON c_type.id = a.type_id
      LEFT JOIN statuses c_size ON c_size.id = a.size_id
      ${whereClause}
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await this.subscriptionRepo.query<RawSubscriberRow[]>(
      dataSql,
      [...queryParams, limit, offset],
    );

    const summaryRows = await this.subscriptionRepo.query<RawSummaryRow[]>(`
      SELECT
        COUNT(*) AS totalCompanies,
        SUM(CASE WHEN a.is_active = 1 THEN 1 ELSE 0 END) AS activeCompanies,
        SUM(CASE WHEN a.is_active = 0 THEN 1 ELSE 0 END) AS inactiveCompanies,
        SUM(
          CASE WHEN EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.app_id = a.id
              AND (
                EXISTS (
                  SELECT 1 FROM invoices i
                  WHERE (i.subscription_id = s.id OR i.app_id = a.id)
                    AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
                )
                OR EXISTS (
                  SELECT 1 FROM subscription_invoices si
                  WHERE si.subscription_id = s.id
                    AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
                )
              )
          ) THEN 1 ELSE 0 END
        ) AS purchasedCompanies,
        SUM(
          CASE WHEN NOT EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.app_id = a.id
              AND (
                EXISTS (
                  SELECT 1 FROM invoices i
                  WHERE (i.subscription_id = s.id OR i.app_id = a.id)
                    AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
                )
                OR EXISTS (
                  SELECT 1 FROM subscription_invoices si
                  WHERE si.subscription_id = s.id
                    AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
                )
              )
          ) THEN 1 ELSE 0 END
        ) AS trialCompanies
      FROM applications a
      WHERE a.deleted_at IS NULL
    `);

    const revenueRows = await this.subscriptionRepo.query<RevenueSummaryRow[]>(`
      SELECT
        COALESCE(SUM(
          CASE WHEN inv.payment_status = 'paid' OR inv.status = 'paid' OR inv.paid_at IS NOT NULL
          THEN inv.total_amount ELSE 0 END
        ), 0) +
        COALESCE(SUM(
          CASE WHEN si.status_id = 38 OR si.paid_at IS NOT NULL
          THEN si.amount ELSE 0 END
        ), 0) AS totalPaidAmount
      FROM applications a
      LEFT JOIN subscriptions s ON s.app_id = a.id
      LEFT JOIN invoices inv ON (inv.subscription_id = s.id OR inv.app_id = a.id) AND (inv.payment_status = 'paid' OR inv.status = 'paid' OR inv.paid_at IS NOT NULL)
      LEFT JOIN subscription_invoices si ON si.subscription_id = s.id AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
      WHERE a.deleted_at IS NULL AND (inv.id IS NOT NULL OR si.id IS NOT NULL)
    `);

    const activePlans = await this.subscriptionRepo.query<
      ActivePlanSummaryRow[]
    >(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.monthly_price,
        p.yearly_price,
        COUNT(DISTINCT CASE WHEN (
          EXISTS (
            SELECT 1 FROM invoices i
            WHERE (i.subscription_id = s.id OR i.app_id = s.app_id)
              AND (i.payment_status = 'paid' OR i.status = 'paid' OR i.paid_at IS NOT NULL)
          ) OR EXISTS (
            SELECT 1 FROM subscription_invoices si
            WHERE si.subscription_id = s.id
              AND (si.status_id = 38 OR si.paid_at IS NOT NULL)
          )
        ) THEN s.app_id ELSE NULL END) AS companyCount
      FROM subscription_plans p
      LEFT JOIN subscriptions s ON s.plan_id = p.id AND EXISTS (
        SELECT 1 FROM applications a WHERE a.id = s.app_id AND a.deleted_at IS NULL
      )
      WHERE p.is_active = 1
      GROUP BY p.id, p.name, p.slug, p.monthly_price, p.yearly_price
      ORDER BY p.id ASC
    `);

    const appSubStatuses = await this.subscriptionRepo.query<
      AppSubStatusRow[]
    >(`
      SELECT id, name, code, color_name AS colorName
      FROM statuses
      WHERE status_group_id = 6
      ORDER BY id ASC
    `);

    const summary = {
      totalCompanies: Number(summaryRows?.[0]?.totalCompanies || 0),
      activeCompanies: Number(summaryRows?.[0]?.activeCompanies || 0),
      inactiveCompanies: Number(summaryRows?.[0]?.inactiveCompanies || 0),
      purchasedCompanies: Number(summaryRows?.[0]?.purchasedCompanies || 0),
      purchasedAmount: Number(revenueRows?.[0]?.totalPaidAmount || 0),
      trialCompanies: Number(summaryRows?.[0]?.trialCompanies || 0),
      premiumCompanies: Number(summaryRows?.[0]?.purchasedCompanies || 0),
      freeCompanies: Number(summaryRows?.[0]?.trialCompanies || 0),
      plans: (activePlans || []).map((p) => ({
        id: Number(p.id),
        name: p.name,
        slug: p.slug,
        monthlyPrice: Number(p.monthly_price || 0),
        yearlyPrice: Number(p.yearly_price || 0),
        count: Number(p.companyCount || 0),
      })),
      planCounts: {
        trial: Number(summaryRows?.[0]?.trialCompanies || 0),
        free: Number(summaryRows?.[0]?.trialCompanies || 0),
        ...Object.fromEntries(
          (activePlans || []).map((p) => [p.slug, Number(p.companyCount || 0)]),
        ),
      },
      appSubStatuses: (appSubStatuses || []).map((s) => ({
        id: Number(s.id),
        name: s.name,
        code: s.code,
        colorName: s.colorName || '',
      })),
    };

    const formattedData = rows.map((r: RawSubscriberRow) => {
      let sub: SubscriptionParsed | null = null;
      if (r.subscription) {
        if (typeof r.subscription === 'object') {
          sub = r.subscription;
        } else if (typeof r.subscription === 'string') {
          try {
            sub = JSON.parse(r.subscription) as SubscriptionParsed;
          } catch {
            sub = null;
          }
        }
      }

      let latestInvoice: InvoiceParsed | null = null;
      if (r.latestInvoice) {
        if (typeof r.latestInvoice === 'object') {
          latestInvoice = r.latestInvoice;
        } else if (typeof r.latestInvoice === 'string') {
          try {
            latestInvoice = JSON.parse(r.latestInvoice) as InvoiceParsed;
          } catch {
            latestInvoice = null;
          }
        }
      }

      let latestSubInvoice: SubscriptionInvoiceParsed | null = null;
      if (r.latestSubscriptionInvoice) {
        if (typeof r.latestSubscriptionInvoice === 'object') {
          latestSubInvoice = r.latestSubscriptionInvoice;
        } else if (typeof r.latestSubscriptionInvoice === 'string') {
          try {
            latestSubInvoice = JSON.parse(
              r.latestSubscriptionInvoice,
            ) as SubscriptionInvoiceParsed;
          } catch {
            latestSubInvoice = null;
          }
        }
      }

      let owner: OwnerParsed | null = null;
      if (r.owner) {
        if (typeof r.owner === 'object') {
          owner = r.owner;
        } else if (typeof r.owner === 'string') {
          try {
            owner = JSON.parse(r.owner) as OwnerParsed;
          } catch {
            owner = null;
          }
        }
      }

      const hasPaidInvoice = Boolean(
        (latestInvoice &&
          (latestInvoice.paymentStatus === 'paid' ||
            latestInvoice.status === 'paid' ||
            latestInvoice.paidAt)) ||
        (latestSubInvoice &&
          (latestSubInvoice.statusId === 38 || latestSubInvoice.paidAt)),
      );
      const isPurchased = Boolean(sub && hasPaidInvoice);

      // Subscription Status from status_group_id = 6 (App Subscription Statuses)
      // 30: Active, 34: Trial, 32: Expired, 33: Canceled
      let subStatusId = 34;
      let subStatusName = 'Trial';
      let subStatusCode = 'app_sub_status_trial';

      if (isPurchased) {
        subStatusId = 30;
        subStatusName = 'Active';
        subStatusCode = 'app_sub_status_active';
      } else if (
        sub?.statusId === 32 ||
        sub?.statusCode === 'app_sub_status_expired'
      ) {
        subStatusId = 32;
        subStatusName = 'Expired';
        subStatusCode = 'app_sub_status_expired';
      } else if (
        sub?.statusId === 33 ||
        sub?.statusCode === 'app_sub_status_canceled'
      ) {
        subStatusId = 33;
        subStatusName = 'Canceled';
        subStatusCode = 'app_sub_status_canceled';
      } else if (
        sub?.statusId === 228 ||
        sub?.statusCode === 'subscription_pending'
      ) {
        subStatusId = 228;
        subStatusName = 'Pending';
        subStatusCode = 'subscription_pending';
      } else {
        // "free means e trail"
        subStatusId = 34;
        subStatusName = 'Trial';
        subStatusCode = 'app_sub_status_trial';
      }

      const isTrial = subStatusId === 34;
      const isPending = subStatusId === 228;

      // "jara kinse paid korse sohodo tader e package show korba r free plan naa diye trail plan deo ba sob free kore deo thik kooro"
      // Only those who paid show the package name (e.g. Enterprise, Growth)
      // For all unpaid / trial companies, show "Trial Plan"
      const planName = isPurchased
        ? sub?.planName || 'Trial Plan'
        : 'Trial Plan';
      const planSlug = isPurchased ? sub?.planSlug || 'trial' : 'trial';

      let purchaseHistory: PurchaseHistoryItem[] = [];
      if (r.purchaseHistory) {
        if (Array.isArray(r.purchaseHistory)) {
          purchaseHistory = r.purchaseHistory;
        } else if (typeof r.purchaseHistory === 'string') {
          try {
            purchaseHistory = JSON.parse(
              r.purchaseHistory,
            ) as PurchaseHistoryItem[];
          } catch {
            purchaseHistory = [];
          }
        }
      }
      if (Array.isArray(purchaseHistory)) {
        purchaseHistory.sort((a, b) => Number(b.id) - Number(a.id));
      } else {
        purchaseHistory = [];
      }

      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        address: r.address,
        isActive: Boolean(r.isActive),
        createdAt: r.createdAt,
        logo:
          r.logoFolderPath && r.logoFilename
            ? `/static/${r.logoFolderPath}/${r.logoFilename}`
            : null,
        isPremium: isPurchased,
        isPurchased,
        isTrial,
        isPending,
        isFree: false,
        hasPaidInvoice,
        planType: isPurchased ? planSlug : 'trial',
        planSlug,
        planName,
        basePlanName: planName,
        evaluatedPlanName: sub?.planName || null,
        evaluatedPlanSlug: sub?.planSlug || null,
        subscriptionStatus: {
          id: subStatusId,
          name: subStatusName,
          code: subStatusCode,
        },
        subscription: sub
          ? {
              ...sub,
              planName: isPurchased
                ? sub.planName || 'Trial Plan'
                : 'Trial Plan',
              planSlug: isPurchased ? sub.planSlug || 'trial' : 'trial',
            }
          : null,
        latestInvoice,
        latestSubInvoice,
        purchaseHistory,
        websiteUrl: r.websiteUrl || null,
        facebookUrl: r.facebookUrl || null,
        linkedinUrl: r.linkedinUrl || null,
        businessType: r.typeName || null,
        companySize: r.sizeName || null,
        totalUsers: Number(r.totalUsers || 0),
        activeUsers: Number(r.activeUsers || 0),
        owner: owner
          ? {
              id: owner.id,
              name: (owner.name || '').trim(),
              email: owner.email || r.email || null,
              phone: owner.phone || r.phone || null,
            }
          : null,
      };
    });

    return {
      status: 'success',
      data: formattedData,
      summary,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCompanyPurchaseHistory(companyId: number) {
    const rawInvoices = await this.invoiceRepo.query(
      `
      SELECT
        inv.id,
        inv.invoice_number AS invoiceNumber,
        inv.total_amount AS totalAmount,
        COALESCE(inv.currency, 'BDT') AS currency,
        inv.status,
        inv.payment_status AS paymentStatus,
        inv.paid_at AS paidAt,
        inv.due_date AS dueDate,
        inv.created_at AS createdAt,
        inv.billing_period_start AS billingPeriodStart,
        inv.billing_period_end AS billingPeriodEnd,
        (
          SELECT sp.name FROM payment_transactions pt
          JOIN subscription_plans sp ON sp.id = pt.subscription_plan_id
          WHERE pt.invoice_id = inv.id
          ORDER BY pt.id DESC LIMIT 1
        ) AS planName,
        (
          SELECT pt2.tran_id FROM payment_transactions pt2
          WHERE pt2.invoice_id = inv.id
          ORDER BY pt2.id DESC LIMIT 1
        ) AS transactionId,
        (
          SELECT pt3.payment_method FROM payment_transactions pt3
          WHERE pt3.invoice_id = inv.id
          ORDER BY pt3.id DESC LIMIT 1
        ) AS paymentMethod,
        (
          SELECT pt4.gateway FROM payment_transactions pt4
          WHERE pt4.invoice_id = inv.id
          ORDER BY pt4.id DESC LIMIT 1
        ) AS gateway
      FROM invoices inv
      WHERE inv.app_id = ?
      ORDER BY inv.id DESC
    `,
      [companyId],
    );

    return {
      status: 'success',
      data: (rawInvoices || []).map((inv: any) => ({
        id: Number(inv.id),
        invoiceNumber: inv.invoiceNumber,
        totalAmount: Number(inv.totalAmount || 0),
        currency: inv.currency || 'BDT',
        status: inv.status,
        paymentStatus: inv.paymentStatus,
        paidAt: inv.paidAt || null,
        dueDate: inv.dueDate || null,
        createdAt: inv.createdAt,
        billingPeriodStart: inv.billingPeriodStart || null,
        billingPeriodEnd: inv.billingPeriodEnd || null,
        planName: inv.planName || null,
        transactionId: inv.transactionId || null,
        paymentMethod: inv.paymentMethod || null,
        gateway: inv.gateway || null,
      })),
    };
  }

  async toggleCompanyStatus(id: number, targetStatus?: boolean) {
    const apps = await this.subscriptionRepo.query<AppToggleRow[]>(
      'SELECT id, name, is_active FROM applications WHERE id = ? AND deleted_at IS NULL',
      [id],
    );

    if (!apps || apps.length === 0) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    const current = apps[0];
    const newStatus =
      targetStatus !== undefined
        ? targetStatus
          ? 1
          : 0
        : current.is_active
          ? 0
          : 1;

    await this.subscriptionRepo.query(
      'UPDATE applications SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id],
    );

    // Synchronize app_users is_active status
    await this.subscriptionRepo.query(
      'UPDATE app_users SET is_active = ?, updated_at = NOW() WHERE app_id = ?',
      [newStatus, id],
    );

    return {
      status: 'success',
      message: `Company "${current.name}" has been ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        id,
        name: current.name,
        isActive: Boolean(newStatus),
      },
    };
  }
}
