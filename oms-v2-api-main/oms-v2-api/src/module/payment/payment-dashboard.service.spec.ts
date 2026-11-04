import { PaymentDashboardService } from './payment-dashboard.service';
import { PaymentDashboardQueryDto, DashboardDateRange } from './dto/payment-dashboard-query.dto';

describe('PaymentDashboardService', () => {
  let service: PaymentDashboardService;
  let mockPaymentRepo: any;
  let mockSubscriptionRepo: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    mockPaymentRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    mockSubscriptionRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    service = new PaymentDashboardService(mockPaymentRepo, mockSubscriptionRepo);
  });

  describe('date ranges', () => {
    it('creates a range for last3Days', () => {
      const range = (service as any).range({ dateRange: DashboardDateRange.LAST_3_DAYS });
      expect(range.from).toBeInstanceOf(Date);
      expect(range.to).toBeInstanceOf(Date);
      expect(range.from.getTime()).toBeLessThan(range.to.getTime());
    });

    it('creates a range for last30Days', () => {
      const range = (service as any).range({ dateRange: DashboardDateRange.LAST_30_DAYS });
      expect(range.from).toBeInstanceOf(Date);
      expect(range.to).toBeInstanceOf(Date);
      expect(range.from.getTime()).toBeLessThan(range.to.getTime());
    });
  });

  describe('transactions', () => {
    it('returns transactions with invoiceId, transactionId, customer, plan, and formatted fields', async () => {
      const mockRawData = [
        {
          id: 1,
          invoiceId: 10,
          tranId: 'txn_123456',
          amount: '1500.00',
          currency: 'BDT',
          status: 'SUCCESS',
          paymentMethod: 'sslcommerz',
          gateway: 'sslcommerz',
          createdAt: new Date('2026-09-24T10:00:00Z'),
          user: { id: 2, firstName: 'Rahim', lastName: 'Ahmed', email: 'rahim@email.com' },
          subscriptionPlan: { id: 3, name: 'Enterprise Plan', billingCycle: 'monthly' },
          invoice: { id: 10, invoiceNumber: 'INV-2026-001' },
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockRawData, 1]);

      const query: PaymentDashboardQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'paymentDate',
        sortOrder: 'DESC',
      };

      const result = await service.transactions(query);

      expect(result.data).toHaveLength(1);
      const txn = result.data[0];

      expect(txn.id).toBe(1);
      expect(txn.invoiceId).toBe(10);
      expect(txn.invoiceNumber).toBe('INV-2026-001');
      expect(txn.transactionId).toBe('txn_123456');
      expect(txn.customerName).toBe('Rahim Ahmed');
      expect(txn.customerEmail).toBe('rahim@email.com');
      expect(txn.planName).toBe('Enterprise Plan');
      expect(txn.billingCycle).toBe('monthly');
      expect(txn.amount).toBe(1500);
      expect(txn.paymentStatus).toBe('success');
      expect(txn.paymentDate).toEqual(new Date('2026-09-24T10:00:00Z'));

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        lastPage: 1,
        resultRows: 1,
      });
    });

    it('handles search and filter parameters (search, status, plan, billingCycle, sort)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: PaymentDashboardQueryDto = {
        page: 1,
        limit: 10,
        search: 'INV-2026-001',
        status: 'SUCCESS' as any,
        plan: 'Enterprise',
        billingCycle: 'monthly' as any,
        sort: 'amount:asc',
        sortBy: 'amount',
        sortOrder: 'ASC',
      };

      await service.transactions(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.status = :status',
        { status: 'SUCCESS' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(payment.tranId LIKE :search OR user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR invoice.invoiceNumber LIKE :search)',
        { search: '%INV-2026-001%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'plan.name LIKE :pName',
        { pName: '%Enterprise%' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('payment.amount', 'ASC');
    });
  });
});