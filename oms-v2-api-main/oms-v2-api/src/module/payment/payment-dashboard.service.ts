import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Helpers } from '@core/utils/helpers';
import { Subscription } from '@module/subscription/entities/subscription.entity';
import {
  DashboardDateRange,
  DashboardGroupBy,
  DashboardPeriod,
  PaymentDashboardQueryDto,
} from './dto/payment-dashboard-query.dto';
import {
  PaymentTransaction,
  PaymentTransactionStatus,
} from './entities/payment-transaction.entity';

type DateRange = { from: Date; to: Date };

@Injectable()
export class PaymentDashboardService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepo: Repository<PaymentTransaction>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  private range(query: PaymentDashboardQueryDto): DateRange {
    const now = new Date();
    let from: Date;
    let to: Date;

    if (query.fromDate || query.toDate) {
      if (!query.fromDate || !query.toDate) {
        throw new BadRequestException('fromDate and toDate must be provided together');
      }
      from = new Date(`${query.fromDate}T00:00:00.000Z`);
      to = new Date(`${query.toDate}T23:59:59.999Z`);
    } else {
      to = now;
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const dayCounts = {
        [DashboardPeriod.TODAY]: 1,
        [DashboardPeriod.THREE_DAYS]: 3,
        [DashboardPeriod.SEVEN_DAYS]: 7,
        [DashboardPeriod.FIFTEEN_DAYS]: 15,
        [DashboardPeriod.THIRTY_DAYS]: 30,
      };
      const period = query.dateRange === DashboardDateRange.LAST_3_DAYS
        ? DashboardPeriod.THREE_DAYS
        : query.dateRange === DashboardDateRange.LAST_30_DAYS
          ? DashboardPeriod.THIRTY_DAYS
          : query.period;
      if (period === DashboardPeriod.THIS_MONTH) {
        from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      } else if (period === DashboardPeriod.LAST_MONTH) {
        from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
        to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
      } else {
        const dayCount = dayCounts[period || DashboardPeriod.THIRTY_DAYS] || 30;
        from = new Date(start);
        from.setUTCDate(from.getUTCDate() - dayCount + 1);
      }
    }

    if (from > to) throw new BadRequestException('fromDate must not be after toDate');
    if (to.getTime() - from.getTime() > 366 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Date range must not exceed 366 days');
    }
    return { from, to };
  }

  private base(query: PaymentDashboardQueryDto, range: DateRange) {
    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.subscriptionPlan', 'plan')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .where('payment.createdAt >= :from AND payment.createdAt <= :to', range);
    if (query.subscriptionPlanId) {
      qb.andWhere('payment.subscriptionPlanId = :planId', { planId: query.subscriptionPlanId });
    }
    if (query.plan) {
      const planVal = query.plan.trim();
      if (!isNaN(Number(planVal))) {
        qb.andWhere('(payment.subscriptionPlanId = :pId OR plan.id = :pId)', { pId: Number(planVal) });
      } else {
        qb.andWhere('plan.name LIKE :pName', { pName: `%${planVal}%` });
      }
    }
    if (query.billingCycle) {
      qb.andWhere('plan.billingCycle = :billingCycle', { billingCycle: query.billingCycle });
    }
    return qb;
  }

  private decimal(value: unknown): string {
    return Number(value || 0).toFixed(2);
  }

  async overview(query: PaymentDashboardQueryDto) {
    const range = this.range(query);
    const totals = await this.base(query, range)
      .select([
        'COALESCE(SUM(CASE WHEN payment.status = :success THEN payment.amount ELSE 0 END), 0) AS totalRevenue',
        'COUNT(CASE WHEN payment.status = :success THEN 1 END) AS successfulPayments',
        'COUNT(CASE WHEN payment.status = :pending THEN 1 END) AS pendingPayments',
        'COUNT(CASE WHEN payment.status = :failed THEN 1 END) AS failedPayments',
        'COUNT(CASE WHEN payment.status = :cancelled THEN 1 END) AS cancelledPayments',
        'COALESCE(SUM(CASE WHEN payment.status = :success AND invoice.paymentStatus = :refunded THEN payment.amount ELSE 0 END), 0) AS refundedAmount',
        'COALESCE(AVG(CASE WHEN payment.status = :success THEN payment.amount END), 0) AS averageTransactionValue',
      ])
      .setParameters({
        success: PaymentTransactionStatus.SUCCESS,
        pending: PaymentTransactionStatus.PENDING,
        failed: PaymentTransactionStatus.FAILED,
        cancelled: PaymentTransactionStatus.CANCELLED,
        refunded: 'refunded',
      })
      .getRawOne();
    const active = await this.subscriptionCount('subscription_active', query, range);
    const createdQuery = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .where('subscription.createdAt >= :from AND subscription.createdAt <= :to', range);
    if (query.subscriptionPlanId) createdQuery.andWhere('subscription.planId = :planId', { planId: query.subscriptionPlanId });
    const created = await createdQuery.getCount();
    const cancelled = await this.subscriptionCount('app_sub_status_cancelled', query, range);
    let totalCompanies = 0;
    let totalUsers = 0;
    try {
      const appsRows = await this.paymentRepo.manager.query("SELECT COUNT(*) as count FROM applications");
      totalCompanies = Number(appsRows?.[0]?.count || 0);
      const usersRows = await this.paymentRepo.manager.query("SELECT COUNT(*) as count FROM users");
      totalUsers = Number(usersRows?.[0]?.count || 0);
    } catch (e) {
      // Fallback
    }

    return {
      data: {
        totalRevenue: this.decimal(totals.totalRevenue),
        grossSales: this.decimal(totals.totalRevenue),
        netRevenue: this.decimal(Number(totals.totalRevenue || 0) - Number(totals.refundedAmount || 0)),
        totalSuccessfulPayments: Number(totals.successfulPayments || 0),
        totalPendingPayments: Number(totals.pendingPayments || 0),
        totalFailedPayments: Number(totals.failedPayments || 0),
        totalRefundedAmount: this.decimal(totals.refundedAmount),
        activeSubscriptions: active,
        newSubscriptions: created,
        cancelledSubscriptions: cancelled,
        averageTransactionValue: this.decimal(totals.averageTransactionValue),
        totalCompanies: totalCompanies,
        totalUsers: totalUsers,
      },
      message: 'Payment dashboard overview retrieved successfully',
    };
  }

  private async subscriptionCount(statusCode: string, query: PaymentDashboardQueryDto, range: DateRange) {
    const qb = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.status', 'status')
      .where('status.code = :statusCode', { statusCode });
    if (statusCode !== 'subscription_active') {
      qb.andWhere('subscription.createdAt >= :from AND subscription.createdAt <= :to', range);
    }
    if (query.subscriptionPlanId) qb.andWhere('subscription.planId = :planId', { planId: query.subscriptionPlanId });
    return qb.getCount();
  }

  async revenueTrend(query: PaymentDashboardQueryDto) {
    const range = this.range(query);
    const groupBy = query.groupBy || DashboardGroupBy.DAY;
    const expression = groupBy === DashboardGroupBy.MONTH
      ? "DATE_FORMAT(payment.created_at, '%Y-%m')"
      : groupBy === DashboardGroupBy.WEEK
        ? "DATE_FORMAT(DATE_SUB(payment.created_at, INTERVAL WEEKDAY(payment.created_at) DAY), '%Y-%m-%d')"
        : 'DATE(payment.created_at)';
    const rows = await this.base(query, range)
      .andWhere('payment.status = :success', { success: PaymentTransactionStatus.SUCCESS })
      .select(expression, 'period')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'revenue')
      .addSelect('COUNT(payment.id)', 'transactionCount')
      .groupBy(expression)
      .orderBy('period', 'ASC')
      .getRawMany();
    return {
      data: {
        summary: {
          totalRevenue: this.decimal(rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0)),
          totalTransactions: rows.reduce((sum, row) => sum + Number(row.transactionCount || 0), 0),
        },
        data: rows.map((row) => ({ period: row.period, revenue: this.decimal(row.revenue), transactionCount: Number(row.transactionCount) })),
      },
      message: 'Revenue trend retrieved successfully',
    };
  }

  async subscriptionSales(query: PaymentDashboardQueryDto) {
    const range = this.range(query);
    const rows = await this.base(query, range)
      .andWhere('payment.status = :success', { success: PaymentTransactionStatus.SUCCESS })
      .select(['payment.subscriptionPlanId AS subscriptionPlanId', 'plan.name AS planName', 'plan.billingCycle AS billingCycle'])
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
      .addSelect('COUNT(payment.id)', 'successfulPaymentCount')
      .groupBy('payment.subscriptionPlanId')
      .addGroupBy('plan.name')
      .addGroupBy('plan.billingCycle')
      .getRawMany();
    const activeRows = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.status', 'status')
      .select('subscription.planId', 'planId')
      .addSelect('COUNT(subscription.id)', 'activeCount')
      .where('status.code = :statusCode', { statusCode: 'subscription_active' })
      .groupBy('subscription.planId')
      .getRawMany();
    const activeCounts = new Map(activeRows.map((row) => [Number(row.planId), Number(row.activeCount)]));
    const data = rows.map((row) => ({
      subscriptionPlanId: Number(row.subscriptionPlanId),
      planName: row.planName,
      billingCycle: row.billingCycle,
      totalRevenue: this.decimal(row.totalRevenue),
      successfulPaymentCount: Number(row.successfulPaymentCount),
      activeSubscriptionCount: activeCounts.get(Number(row.subscriptionPlanId)) || 0,
    }));
    return {
      data,
      summary: {
        totalRevenue: this.decimal(data.reduce((sum, row) => sum + Number(row.totalRevenue), 0)),
        totalPayments: data.reduce((sum, row) => sum + row.successfulPaymentCount, 0),
      },
      message: 'Subscription sales retrieved successfully',
    };
  }

  async transactions(query: PaymentDashboardQueryDto) {
    const range = this.range(query);
    const qb = this.base(query, range).select([
      'payment.id',
      'payment.invoiceId',
      'payment.tranId',
      'payment.amount',
      'payment.currency',
      'payment.status',
      'payment.paymentMethod',
      'payment.gateway',
      'payment.createdAt',
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'plan.id',
      'plan.name',
      'plan.billingCycle',
      'invoice.id',
      'invoice.invoiceNumber',
    ]);
    if (query.status) qb.andWhere('payment.status = :status', { status: query.status });
    if (query.search) {
      const searchTerm = `%${query.search.trim()}%`;
      qb.andWhere(
        '(payment.tranId LIKE :search OR user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR invoice.invoiceNumber LIKE :search)',
        { search: searchTerm },
      );
    }

    let sortField = 'payment.createdAt';
    let sortOrder = query.sortOrder;

    if (query.sort) {
      const [sField, sOrder] = query.sort.split(':');
      if (sField) {
        const fieldLower = sField.toLowerCase();
        if (fieldLower === 'paymentdate' || fieldLower === 'createdat') {
          sortField = 'payment.createdAt';
        } else if (fieldLower === 'amount') {
          sortField = 'payment.amount';
        } else if (fieldLower === 'transactionid' || fieldLower === 'tranid') {
          sortField = 'payment.tranId';
        }
      }
      if (sOrder && (sOrder.toUpperCase() === 'ASC' || sOrder.toUpperCase() === 'DESC')) {
        sortOrder = sOrder.toUpperCase() as 'ASC' | 'DESC';
      }
    } else {
      sortField =
        query.sortBy === 'amount'
          ? 'payment.amount'
          : query.sortBy === 'transactionId'
            ? 'payment.tranId'
            : 'payment.createdAt';
    }

    const [rawEntities, total] = await qb
      .orderBy(sortField, sortOrder)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    const data = rawEntities.map((item) => {
      const invoiceId = item.invoiceId ?? item.invoice?.id ?? null;
      const invoiceNumber = item.invoice?.invoiceNumber ?? null;
      const customerName = item.user
        ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim()
        : null;
      const customerEmail = item.user?.email ?? null;
      const planName = item.subscriptionPlan?.name ?? null;
      const billingCycle = item.subscriptionPlan?.billingCycle ?? null;

      return {
        ...item,
        invoiceId,
        invoiceNumber,
        transactionId: item.tranId,
        customerName,
        customerEmail,
        planName,
        billingCycle,
        amount: Number(item.amount),
        paymentStatus: item.status?.toLowerCase() || item.status,
        paymentDate: item.createdAt,
      };
    });

    return {
      data,
      pagination: Helpers.makePaginationData(query, { data, total }),
      message: 'Payment transactions retrieved successfully',
    };
  }

  async paymentStatistics(query: PaymentDashboardQueryDto) {
    const range = this.range(query);
    const row = await this.base(query, range)
      .select('COUNT(payment.id)', 'attempts')
      .addSelect('SUM(payment.status = :success)', 'successful')
      .addSelect('SUM(payment.status = :pending)', 'pending')
      .addSelect('SUM(payment.status = :failed)', 'failed')
      .addSelect('SUM(payment.status = :cancelled)', 'cancelled')
      .addSelect('SUM(invoice.paymentStatus = :refunded)', 'refunded')
      .setParameters({ success: PaymentTransactionStatus.SUCCESS, pending: PaymentTransactionStatus.PENDING, failed: PaymentTransactionStatus.FAILED, cancelled: PaymentTransactionStatus.CANCELLED, refunded: 'refunded' })
      .getRawOne();
    const attempts = Number(row.attempts || 0);
    return {
      data: {
        totalPaymentAttempts: attempts,
        successfulPayments: Number(row.successful || 0),
        pendingPayments: Number(row.pending || 0),
        failedPayments: Number(row.failed || 0),
        cancelledPayments: Number(row.cancelled || 0),
        refundedPayments: Number(row.refunded || 0),
        successRate: attempts ? Number(row.successful || 0) / attempts : 0,
        failureRate: attempts ? Number(row.failed || 0) / attempts : 0,
      },
      message: 'Payment statistics retrieved successfully',
    };
  }

  async subscriptionStatistics(query: PaymentDashboardQueryDto) {
    const range = this.range(query);
    const active = await this.subscriptionCount('subscription_active', query, range);
    const createdQuery = this.subscriptionRepo.createQueryBuilder('subscription').where('subscription.createdAt BETWEEN :from AND :to', range);
    if (query.subscriptionPlanId) createdQuery.andWhere('subscription.planId = :planId', { planId: query.subscriptionPlanId });
    const [newSubscriptions, expired, cancelled, expiring7, expiring30] = await Promise.all([
      createdQuery.getCount(),
      this.subscriptionCount('app_sub_status_expired', query, range),
      this.subscriptionCount('app_sub_status_cancelled', query, range),
      this.expiringSubscriptions(7, query),
      this.expiringSubscriptions(30, query),
    ]);
    return {
      data: {
        totalActiveSubscriptions: active,
        newSubscriptions,
        expiredSubscriptions: expired,
        cancelledSubscriptions: cancelled,
        renewals: null,
        expiringInNext7Days: expiring7,
        expiringInNext30Days: expiring30,
      },
      message: 'Subscription statistics retrieved successfully',
    };
  }

  private expiringSubscriptions(days: number, query: PaymentDashboardQueryDto) {
    const to = new Date();
    to.setUTCDate(to.getUTCDate() + days);
    const qb = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.status', 'status')
      .where('status.code = :status', { status: 'subscription_active' })
      .andWhere('subscription.endDate BETWEEN :from AND :to', { from: new Date(), to });
    if (query.subscriptionPlanId) qb.andWhere('subscription.planId = :planId', { planId: query.subscriptionPlanId });
    return qb.getCount();
  }

  async exportCsv(query: PaymentDashboardQueryDto) {
    const result = await this.transactions({ ...query, page: 1, limit: 100 } as PaymentDashboardQueryDto);
    const headers = ['transactionId', 'amount', 'currency', 'status', 'paymentMethod', 'gateway', 'paymentDate', 'customerName', 'customerEmail', 'planName', 'billingCycle', 'invoiceNumber'];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = result.data.map((payment) => [
      payment.tranId,
      payment.amount,
      payment.currency,
      payment.status,
      payment.paymentMethod,
      payment.gateway,
      payment.createdAt.toISOString(),
      `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim(),
      payment.user?.email,
      payment.subscriptionPlan?.name,
      payment.subscriptionPlan?.billingCycle,
      payment.invoice?.invoiceNumber,
    ].map(escape).join(','));
    return [headers.join(','), ...rows].join('\n');
  }
}