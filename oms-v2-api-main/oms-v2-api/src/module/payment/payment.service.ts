import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '@module/users/entities/user.entity';
import {
  BillingCycle,
  SubscriptionPlan,
} from '@module/subscription/entities/subscription-plan.entity';
import { Subscription } from '@module/subscription/entities/subscription.entity';
import { Status } from '@module/status/entities/status.entity';
import { SubscriptionService } from '@module/subscription/subscription.service';
import { Invoice, PaymentStatus } from '@module/subscription/entities/invoices.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import {
  PaymentTransaction,
  PaymentTransactionStatus,
} from './entities/payment-transaction.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paymentTimeoutMs = this.getTimeoutMs(
    process.env.PAYMENT_INITIATION_TIMEOUT_MS,
    15000,
  );
  private readonly sslTimeoutMs = Math.min(
    this.paymentTimeoutMs,
    this.getTimeoutMs(process.env.SSLCOMMERZ_REQUEST_TIMEOUT_MS, 10000),
  );

  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepo: Repository<PaymentTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly subscriptionService: SubscriptionService,
    private readonly dataSource: DataSource,
  ) {}

  private getSslConfig() {
    const config = this.configService.get('sslcommerz') as {
      mode: 'sandbox' | 'live';
      storeId: string;
      storePassword: string;
      initUrl: string;
      validationUrl: string;
      transactionQueryUrl: string;
    };

    if (!config?.storeId || !config?.storePassword) {
      throw new UnprocessableEntityException(
        'SSLCOMMERZ credentials are not configured for the selected payment mode.',
      );
    }

    return config;
  }

  private getTimeoutMs(value: string | undefined, fallback: number): number {
    const timeout = Number(value);
    return Number.isFinite(timeout) ? Math.max(1000, timeout) : fallback;
  }

  private getFrontendUrl(): string {
    const frontendUrl =
      process.env.FRONTEND_URL?.toString().trim() || 'http://localhost:3000';

    return frontendUrl.replace(/\/$/, '');
  }

  private getServiceUrl(): string {
    const serviceUrl =
      process.env.SERVICE_URL?.toString().trim() ||
      process.env.BACKEND_URL?.toString().trim() ||
      `http://localhost:${process.env.PORT || 4000}`;

    return serviceUrl.replace(/\/$/, '');
  }

  private buildCallbackUrl(type: 'success' | 'fail' | 'cancel' | 'ipn'): string {
    return `${this.getServiceUrl()}/api/v1/payment/${type}`;
  }

  public generateTranId(): string {
    return `OMS_${Date.now()}_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  private buildFormUrlEncoded(data: Record<string, any>): string {
    const params = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params.append(key, String(value));
    });

    return params.toString();
  }

  private async withTimeout<T>(
    operation: Promise<T>,
    label: string,
    timeoutMs = this.paymentTimeoutMs,
  ): Promise<T> {
    let timeoutHandle: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new RequestTimeoutException(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([operation, timeout]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }

  private logStage(stage: string, startedAt: number): void {
    this.logger.debug(`Payment initiation stage=${stage} durationMs=${Date.now() - startedAt}`);
  }

  async initiatePayment(dto: InitiatePaymentDto, user: User) {
    const requestStartedAt = Date.now();
    const authUser = await this.withTimeout(
      this.userRepo
        .createQueryBuilder('user')
        .leftJoin('user.profile', 'profile')
        .select([
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.email',
          'user.activeAppId',
          'profile.phone',
        ])
        .where('user.id = :userId', { userId: user?.id })
        .getOne(),
      'Authenticated user lookup',
    );
    this.logStage('user_lookup', requestStartedAt);

    if (!authUser) {
      throw new NotFoundException('Authenticated user not found');
    }

    const planStartedAt = Date.now();
    const plan = await this.withTimeout(this.subscriptionPlanRepo.findOne({
      where: { id: dto.subscriptionPlanId },
    }), 'Subscription plan lookup');
    this.logStage('plan_lookup', planStartedAt);

    if (!plan) {
      throw new NotFoundException(
        `Subscription plan with ID ${dto.subscriptionPlanId} not found`,
      );
    }

    if (!plan.isActive) {
      throw new BadRequestException('The selected subscription plan is inactive');
    }

    const sslConfig = this.getSslConfig();
    const selectedBillingCycle = this.resolveBillingCycle(
      dto.billingCycle,
      plan.billingCycle,
    );
    const amount = this.getPlanAmount(plan, selectedBillingCycle);
    const currency = (plan.currency || 'BDT').toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('The selected subscription plan has an invalid amount');
    }

    if (currency === 'BDT' && (amount < 10 || amount > 500000)) {
      throw new BadRequestException(
        'SSLCOMMERZ supports subscription amounts between 10.00 and 500000.00 BDT',
      );
    }

    const appId = authUser.activeAppId ?? 1;
    const subscriptionStartedAt = Date.now();
    const existingSubscription = await this.withTimeout(this.subscriptionRepo.findOne({
      where: { userId: authUser.id, appId },
      relations: ['plan'],
    }), 'Existing subscription lookup');
    this.logStage('subscription_lookup', subscriptionStartedAt);

    const isTrial = Boolean(
      existingSubscription &&
        (existingSubscription.paymentMethod === 'trial' ||
          existingSubscription.statusId === 34),
    );

    const isUpgrade = Boolean(
      existingSubscription && existingSubscription.planId !== plan.id,
    );

    const savedInvoice = await this.withTimeout(
      this.invoiceRepo.save(this.invoiceRepo.create({
        userId: authUser.id,
        appId,
        invoiceNumber: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        baseAmount: amount,
        perUserAmount: 0,
        userCount: 1,
        subtotal: amount,
        totalAmount: amount,
        currency,
        status: 'pending',
        paymentStatus: PaymentStatus.UNPAID,
        dueDate: new Date(),
      })),
      'Invoice save',
    );

    if (existingSubscription && !isUpgrade && !isTrial) {
      throw new ConflictException(
        'User already has an active paid subscription for this plan.',
      );
    }

    const pendingStartedAt = Date.now();
    const existingPending = await this.withTimeout(this.paymentTransactionRepo.findOne({
      where: {
        userId: authUser.id,
        subscriptionPlanId: plan.id,
        status: PaymentTransactionStatus.PENDING,
      },
    }), 'Pending payment lookup');
    this.logStage('pending_payment_lookup', pendingStartedAt);

    if (existingPending) {
      await this.withTimeout(
        this.paymentTransactionRepo.update(existingPending.id, {
          status: PaymentTransactionStatus.CANCELLED,
          gatewayResponse: {
            ...(existingPending.gatewayResponse || {}),
            cancelledAt: new Date().toISOString(),
            cancellationReason: 'Replaced by a new payment attempt',
          } as Record<string, any>,
        }),
        'Cancelled pending payment update',
      );
      this.logger.warn(
        `Cancelled pending payment transaction id=${existingPending.id}, tranId=${existingPending.tranId} before starting a new attempt`,
      );
    }

    const tranId = this.generateTranId();

    const payment = this.paymentTransactionRepo.create({
      userId: authUser.id,
      user: authUser,
      subscriptionPlanId: plan.id,
      subscriptionPlan: plan,
      invoiceId: savedInvoice.id,
      invoice: savedInvoice,
      tranId,
      amount,
      currency,
      status: PaymentTransactionStatus.PENDING,
      paymentMethod: 'sslcommerz',
      gateway: 'sslcommerz',
      gatewayResponse: {
        isUpgrade: isUpgrade || isTrial,
        isTrialConversion: isTrial,
        previousSubscriptionId: existingSubscription?.id ?? null,
        selectedBillingCycle,
      },
    });

    const saveStartedAt = Date.now();
    const savedPayment = await this.withTimeout(
      this.paymentTransactionRepo.save(payment),
      'Payment transaction save',
    );
    this.logStage('payment_transaction_save', saveStartedAt);

    const payload = {
      store_id: sslConfig.storeId,
      store_passwd: sslConfig.storePassword,
      total_amount: Number(amount).toFixed(2),
      currency,
      tran_id: savedPayment.tranId,
      success_url: this.buildCallbackUrl('success'),
      fail_url: this.buildCallbackUrl('fail'),
      cancel_url: this.buildCallbackUrl('cancel'),
      cus_name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Customer',
      cus_email: authUser.email,
      cus_phone: authUser.profile?.phone || '01700000000',
      cus_add1: 'N/A',
      cus_add2: 'N/A',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      num_of_item: 1,
      ship_name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Customer',
      ship_add1: 'N/A',
      ship_add2: 'N/A',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      product_name: plan.name,
      product_category: 'subscription',
      product_profile: 'non-physical-goods',
      value_a: String(authUser.id),
      value_b: String(plan.id),
      value_c: String(appId),
      value_d: 'subscription',
      ipn_url: this.buildCallbackUrl('ipn'),
    };

    let response;
    const sslStartedAt = Date.now();
    try {
      response = await this.httpService.axiosRef.post(
        sslConfig.initUrl,
        this.buildFormUrlEncoded(payload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: this.sslTimeoutMs,
        },
      );
      this.logStage('sslcommerz_init', sslStartedAt);
    } catch (error) {
      this.logStage('sslcommerz_init_failed', sslStartedAt);
      const reason =
        (error as any)?.response?.data?.failedreason ||
        (error as Error).message ||
        'Unable to connect to SSLCOMMERZ';

      await this.withTimeout(
        this.paymentTransactionRepo.update(savedPayment.id, {
          status: PaymentTransactionStatus.FAILED,
          gatewayResponse: {
            ...(savedPayment.gatewayResponse || {}),
            error: reason,
          },
        }),
        'Failed payment transaction update',
      );

      throw new UnprocessableEntityException(`SSLCOMMERZ request failed: ${reason}`);
    }

    const sslResponse = response.data || {};
    const gatewayUrl =
      sslResponse.GatewayPageURL ||
      sslResponse.redirectGatewayURL ||
      sslResponse.gatewayPageURL;

    if (sslResponse?.status !== 'SUCCESS' || !gatewayUrl) {
      await this.withTimeout(
        this.paymentTransactionRepo.update(savedPayment.id, {
          status: PaymentTransactionStatus.FAILED,
          gatewayResponse: sslResponse,
        }),
        'Invalid payment gateway response update',
      );

      throw new UnprocessableEntityException(
        sslResponse?.failedreason || 'SSLCOMMERZ payment initiation failed',
      );
    }

    const responseSaveStartedAt = Date.now();
    await this.withTimeout(
      this.paymentTransactionRepo.update(savedPayment.id, {
        gatewayResponse: sslResponse,
      }),
      'Payment gateway response update',
    );
    this.logStage('gateway_response_update', responseSaveStartedAt);

    this.logger.log(
      `Payment initiated for user=${authUser.id}, plan=${plan.id}, tranId=${savedPayment.tranId}, mode=${sslConfig.mode}, totalDurationMs=${Date.now() - requestStartedAt}`,
    );

    return {
      tranId: savedPayment.tranId,
      gatewayUrl,
    };
  }

  private resolveBillingCycle(
    requested?: string | null,
    planDefault?: BillingCycle | string | null,
  ): BillingCycle {
    const raw = String(requested ?? planDefault ?? BillingCycle.MONTHLY).toLowerCase();
    return raw.includes('year') ? BillingCycle.YEARLY : BillingCycle.MONTHLY;
  }

  private getPlanAmount(plan: SubscriptionPlan, billingCycle: BillingCycle): number {
    if (billingCycle === BillingCycle.YEARLY) {
      const yearly =
        Number(plan.yearlyPrice || 0) || Number(plan.perUserYearlyPrice || 0);
      return yearly;
    }

    return Number(plan.monthlyPrice || 0);
  }

  public async findPaymentByIdOrTranId(identifier: string | number) {
    const rawStr = String(identifier || '').trim();
    if (!rawStr) {
      throw new NotFoundException('Transaction identifier cannot be empty');
    }

    const isNumeric = /^\d+$/.test(rawStr);
    let payment: PaymentTransaction | null = null;

    if (isNumeric) {
      const numId = Number(rawStr);
      payment = await this.paymentTransactionRepo.findOne({
        where: [{ id: numId }, { invoiceId: numId }],
        relations: [
          'subscriptionPlan',
          'invoice',
          'subscription',
          'subscription.plan',
          'user',
          'user.profile',
        ],
      });
    }

    if (!payment) {
      payment = await this.paymentTransactionRepo.findOne({
        where: { tranId: rawStr },
        relations: [
          'subscriptionPlan',
          'invoice',
          'subscription',
          'subscription.plan',
          'user',
          'user.profile',
        ],
      });
    }

    if (!payment && isNumeric) {
      const invoice = await this.invoiceRepo.findOne({
        where: { id: Number(rawStr) },
        relations: ['paymentTransactions', 'subscription', 'subscription.plan', 'user'],
      });
      if (invoice?.paymentTransactions?.[0]) {
        return this.findPaymentByIdOrTranId(invoice.paymentTransactions[0].tranId);
      }
    }

    if (!payment) {
      throw new NotFoundException(`Payment transaction not found for identifier=${identifier}`);
    }

    return payment;
  }

  public async findPaymentByTranId(tranId: string) {
    return this.findPaymentByIdOrTranId(tranId);
  }

  private async validateTransactionWithSsl(
    payment: PaymentTransaction,
    valId?: string,
    payload: any = {},
  ) {
    const sslConfig = this.getSslConfig();
    const transactionValId = valId || (payment.gatewayResponse as any)?.val_id;

    if (!transactionValId) {
      throw new BadRequestException('SSLCOMMERZ validation ID is missing');
    }

    const validationUrl = `${sslConfig.validationUrl}?val_id=${encodeURIComponent(transactionValId)}&store_id=${encodeURIComponent(sslConfig.storeId)}&store_passwd=${encodeURIComponent(sslConfig.storePassword)}&v=1&format=json`;

    const response = await this.withTimeout(
      this.httpService.axiosRef.get(validationUrl, {
        timeout: this.sslTimeoutMs,
      }),
      'SSLCOMMERZ payment validation',
      this.sslTimeoutMs,
    );

    const result = response.data || {};
    this.logger.log(`SSLCOMMERZ validation response tranId=${payment.tranId} status=${result.status || 'UNKNOWN'}`);

    if (result.status !== 'VALID' && result.status !== 'VALIDATED') {
      throw new BadRequestException(
        `SSLCOMMERZ validation failed for tran_id=${payment.tranId}: ${result.status || 'UNKNOWN'}`,
      );
    }

    const gatewayTranId = result.tran_id || payload.tran_id || payload.tranId;
    if (gatewayTranId !== payment.tranId) {
      throw new BadRequestException(
        `SSLCOMMERZ transaction mismatch. Expected ${payment.tranId}, got ${gatewayTranId || 'MISSING'}`,
      );
    }

    const validatedAmount = Number(result.amount || 0);
    const expectedAmount = Number(payment.amount || 0);

    this.logger.log(`SSLCOMMERZ amount comparison tranId=${payment.tranId} expected=${expectedAmount} received=${validatedAmount}`);
    if (Math.abs(validatedAmount - expectedAmount) > 0.001) {
      throw new BadRequestException(
        `Amount mismatch for tran_id=${payment.tranId}. Expected ${expectedAmount}, got ${validatedAmount}`,
      );
    }

    const validatedCurrency = (result.currency || payload.currency || '').toUpperCase();
    this.logger.log(`SSLCOMMERZ currency comparison tranId=${payment.tranId} expected=${payment.currency} received=${validatedCurrency}`);
    if (validatedCurrency !== (payment.currency || '').toUpperCase()) {
      throw new BadRequestException(
        `Currency mismatch for tran_id=${payment.tranId}. Expected ${payment.currency}, got ${result.currency}`,
      );
    }

    return result;
  }

  async handleSuccessCallback(payload: any, processPayment = true) {
    const tranId = payload.tran_id || payload.tranId;
    if (!tranId) {
      throw new BadRequestException('Transaction ID is missing in callback payload');
    }

    const payment = await this.findPaymentByTranId(tranId);

    if (!processPayment) {
      this.logger.log(`SSLCOMMERZ success callback received tranId=${tranId}; awaiting confirmation`);
      return {
        success: true,
        message: 'Payment received. Verification in progress.',
        data: {
          tranId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          planName: payment.subscriptionPlan?.name,
        },
      };
    }

    if (
      payment.status === PaymentTransactionStatus.SUCCESS ||
      payment.status === PaymentTransactionStatus.VALIDATED
    ) {
      return {
        success: true,
        message: 'Payment already processed',
        data: {
          tranId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          planName: payment.subscriptionPlan?.name,
          subscriptionId: payment.subscriptionId,
        },
      };
    }

    const gatewayResponse = {
      ...(payment.gatewayResponse || {}),
      ...payload,
      callbackType: 'success',
    };

    await this.paymentTransactionRepo.update(payment.id, { gatewayResponse });

    try {
      const validatedData = await this.validateTransactionWithSsl(payment, payload.val_id || payload.valId, payload);

      const processed = await this.dataSource.transaction(async (manager) => {
        const paymentRepo = manager.getRepository(PaymentTransaction);
        const transaction = await paymentRepo.findOne({
          where: { id: payment.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!transaction) {
          throw new NotFoundException(`Payment transaction ${payment.id} not found during processing`);
        }

        if (
          transaction.status === PaymentTransactionStatus.SUCCESS ||
          transaction.status === PaymentTransactionStatus.VALIDATED
        ) {
          return {
            alreadyProcessed: true,
            tranId,
          };
        }

        const isUpgrade = Boolean((transaction.gatewayResponse as any)?.isUpgrade);
        const transactionUser = await this.withTimeout(
          this.userRepo
            .createQueryBuilder('user')
            .select(['user.id', 'user.activeAppId'])
            .where('user.id = :userId', { userId: transaction.userId })
            .getOne(),
          'Payment user lookup',
        );
        const selectedBillingCycle = this.resolveBillingCycle(
          (transaction.gatewayResponse as Record<string, unknown>)
            ?.selectedBillingCycle as string | undefined,
          transaction.subscriptionPlan?.billingCycle,
        );
        const subscriptionRecord = await this.subscriptionService.createSubscriptionForUser(
          transaction.userId,
          transactionUser?.activeAppId ?? 1,
          transaction.subscriptionPlanId,
          'sslcommerz',
          manager,
          isUpgrade,
          selectedBillingCycle,
        );

        await paymentRepo.update(transaction.id, {
          status: PaymentTransactionStatus.SUCCESS,
          subscriptionId: subscriptionRecord.id,
          gatewayResponse: {
            ...(transaction.gatewayResponse || {}),
            validation: validatedData,
            val_id: validatedData.val_id,
            bank_tran_id: validatedData.bank_tran_id,
            validatedAt: new Date().toISOString(),
          } as Record<string, any>,
        });

        if (transaction.invoiceId) {
          await manager.getRepository(Invoice).update(transaction.invoiceId, {
            status: 'paid',
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
            subscriptionId: subscriptionRecord.id,
            billingPeriodStart: subscriptionRecord.startDate,
            billingPeriodEnd: subscriptionRecord.endDate,
          });
          this.logger.log(`Invoice updated invoiceId=${transaction.invoiceId} tranId=${transaction.tranId}`);
        }

        return {
          alreadyProcessed: false,
          tranId,
          subscriptionId: subscriptionRecord.id,
        };
      });

      return {
        success: true,
        message: 'Payment validated successfully',
        data: processed,
      };
    } catch (error) {
      await this.paymentTransactionRepo.update(payment.id, {
        status: PaymentTransactionStatus.FAILED,
        gatewayResponse: { ...(payment.gatewayResponse || {}), ...payload, validationError: (error as Error).message },
      });

      throw error;
    }
  }

  async handleIpnCallback(payload: any) {
    const tranId = payload.tran_id || payload.tranId;
    if (!tranId) throw new BadRequestException('Transaction ID is missing in IPN payload');
    this.logger.log(`SSLCOMMERZ IPN received tranId=${tranId}`);

    const gatewayStatus = String(payload.status || '').toUpperCase();
    if (gatewayStatus && gatewayStatus !== 'VALID' && gatewayStatus !== 'VALIDATED') {
      const payment = await this.findPaymentByTranId(tranId);
      if (gatewayStatus === 'FAILED' || gatewayStatus === 'INVALID_TRANSACTION' || gatewayStatus === 'EXPIRED') {
        await this.handleFailCallback(payload);
      } else if (gatewayStatus === 'CANCELLED') {
        await this.handleCancelCallback(payload);
      } else {
        await this.paymentTransactionRepo.update(payment.id, {
          gatewayResponse: { ...(payment.gatewayResponse || {}), ...payload, ipnReceivedAt: new Date().toISOString() },
        });
      }
      return { success: true, message: 'IPN status recorded', data: { tranId, status: gatewayStatus || 'PENDING' } };
    }

    return this.handleSuccessCallback(payload, true);
  }

  async verifyTransaction(tranId: string) {
    const payment = await this.findPaymentByTranId(tranId);

    // If already validated and success, return immediately with enriched transaction info
    if (
      payment.status === PaymentTransactionStatus.SUCCESS ||
      payment.status === PaymentTransactionStatus.VALIDATED
    ) {
      return {
        success: true,
        message: 'Payment verified and active',
        data: {
          tranId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          planName: payment.subscriptionPlan?.name,
          planDescription: payment.subscriptionPlan?.description,
          subscriptionId: payment.subscriptionId,
          invoiceId: payment.invoiceId,
          invoiceNumber: payment.invoice?.invoiceNumber,
          createdAt: payment.createdAt,
        },
      };
    }

    const sslConfig = this.getSslConfig();
    const queryUrl = `${sslConfig.transactionQueryUrl}?tran_id=${encodeURIComponent(tranId)}&store_id=${encodeURIComponent(sslConfig.storeId)}&store_passwd=${encodeURIComponent(sslConfig.storePassword)}&format=json`;
    this.logger.log(`SSLCOMMERZ transaction query tranId=${tranId}`);
    const response = await this.withTimeout(
      this.httpService.axiosRef.get(queryUrl, { timeout: this.sslTimeoutMs }),
      'SSLCOMMERZ transaction query',
      this.sslTimeoutMs,
    );
    const result = response.data || {};
    const transactions = Array.isArray(result.element) ? result.element : [];
    const transactionResult = transactions.find(
      (item: any) => item?.tran_id === tranId,
    ) || transactions[0];
    const gatewayStatus = String(
      transactionResult?.status || result.status || '',
    ).toUpperCase();

    this.logger.log(
      `SSLCOMMERZ transaction query response tranId=${tranId} status=${gatewayStatus || 'UNKNOWN'} matches=${transactions.length}`,
    );

    if (gatewayStatus === 'VALID' || gatewayStatus === 'VALIDATED') {
      return this.handleSuccessCallback(
        { ...(transactionResult || result), tran_id: tranId },
        true,
      );
    }
    if (gatewayStatus === 'FAILED' || gatewayStatus === 'CANCELLED' || gatewayStatus === 'EXPIRED') {
      await this.paymentTransactionRepo.update(payment.id, {
        status: gatewayStatus === 'CANCELLED' ? PaymentTransactionStatus.CANCELLED : PaymentTransactionStatus.FAILED,
        gatewayResponse: { ...(payment.gatewayResponse || {}), query: result },
      });
    }
    return {
      success: true,
      data: {
        tranId,
        status: gatewayStatus || payment.status || 'PENDING',
        amount: payment.amount,
        currency: payment.currency,
        planName: payment.subscriptionPlan?.name,
      },
    };
  }

  async getTransactionDetails(identifier: string | number) {
    const payment = await this.findPaymentByIdOrTranId(identifier);
    const plan = payment.subscriptionPlan || (payment.subscription as any)?.plan;
    const invoice = payment.invoice;
    const user = payment.user;
    const gateway = (payment.gatewayResponse as Record<string, any>) || {};
    const validation = gateway.validation || {};

    return {
      success: true,
      data: {
        id: payment.id,
        tranId: payment.tranId,
        status: payment.status,
        amount: Number(payment.amount),
        currency: payment.currency,
        paymentMethod: payment.paymentMethod || 'sslcommerz',
        gateway: payment.gateway || 'sslcommerz',
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,

        // SSLCOMMERZ Payment Gateway Details
        sslcommerz: {
          valId: gateway.val_id || validation.val_id || null,
          bankTranId: gateway.bank_tran_id || validation.bank_tran_id || null,
          cardType: gateway.card_type || validation.card_type || null,
          cardBrand: gateway.card_brand || validation.card_brand || null,
          cardIssuer: gateway.card_issuer || validation.card_issuer || null,
          cardIssuerCountry: gateway.card_issuer_country || validation.card_issuer_country || null,
          storeAmount: gateway.store_amount || validation.store_amount || null,
          tranDate: gateway.tran_date || validation.tran_date || null,
          riskLevel: gateway.risk_level ?? validation.risk_level ?? null,
          riskTitle: gateway.risk_title || validation.risk_title || null,
          currencyType: gateway.currency_type || gateway.currency || payment.currency,
          gatewayStatus: gateway.status || validation.status || payment.status,
          validationError: gateway.validationError || null,
          sessionKey: gateway.sessionkey || null,
        },

        // Subscription Plan Details
        plan: plan
          ? {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              monthlyPrice: Number(plan.monthlyPrice || 0),
              yearlyPrice: Number(plan.yearlyPrice || 0),
              currency: plan.currency || payment.currency,
              billingCycle: plan.billingCycle || 'Monthly',
              minUsers: plan.minUsers,
              maxUsers: plan.maxUsers,
              trialDays: plan.trialDays,
              features: plan.features,
              isActive: plan.isActive,
            }
          : null,

        // Invoice & Billing Details
        invoice: invoice
          ? {
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              baseAmount: Number(invoice.baseAmount || 0),
              perUserAmount: Number(invoice.perUserAmount || 0),
              userCount: invoice.userCount || 1,
              subtotal: Number(invoice.subtotal || invoice.totalAmount || payment.amount),
              taxAmount: Number(invoice.taxAmount || 0),
              discountAmount: Number(invoice.discountAmount || 0),
              totalAmount: Number(invoice.totalAmount || payment.amount),
              currency: invoice.currency || payment.currency,
              status: invoice.status,
              paymentStatus: invoice.paymentStatus,
              billingPeriodStart: invoice.billingPeriodStart || (payment.subscription as any)?.startDate || null,
              billingPeriodEnd: invoice.billingPeriodEnd || (payment.subscription as any)?.endDate || null,
              dueDate: invoice.dueDate,
              paidAt: invoice.paidAt || payment.updatedAt,
            }
          : null,

        // Customer Details
        customer: user
          ? {
              id: user.id,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer',
              email: user.email,
              phone: (user as any).profile?.phone || null,
            }
          : null,
      },
    };
  }

  async handleFailCallback(payload: any) {
    const tranId = payload.tran_id || payload.tranId;
    if (!tranId) {
      return { success: false, message: 'Transaction ID is missing in callback payload' };
    }

    const payment = await this.findPaymentByTranId(tranId);

    if (payment.status === PaymentTransactionStatus.SUCCESS || payment.status === PaymentTransactionStatus.VALIDATED) {
      return { success: true, message: 'Payment already processed', data: { tranId } };
    }

    await this.paymentTransactionRepo.update(payment.id, {
      status: PaymentTransactionStatus.FAILED,
      gatewayResponse: { ...(payment.gatewayResponse || {}), ...payload, callbackType: 'fail' },
    });
    if (payment.invoiceId) {
      await this.invoiceRepo.update(payment.invoiceId, {
        status: 'failed',
        paymentStatus: PaymentStatus.FAILED,
      });
    }

    return {
      success: false,
      message: 'Payment failed',
      data: { tranId },
    };
  }

  async handleCancelCallback(payload: any) {
    const tranId = payload.tran_id || payload.tranId;
    if (!tranId) {
      return { success: false, message: 'Transaction ID is missing in callback payload' };
    }

    const payment = await this.findPaymentByTranId(tranId);

    if (payment.status === PaymentTransactionStatus.SUCCESS || payment.status === PaymentTransactionStatus.VALIDATED) {
      return { success: true, message: 'Payment already processed', data: { tranId } };
    }

    await this.paymentTransactionRepo.update(payment.id, {
      status: PaymentTransactionStatus.CANCELLED,
      gatewayResponse: { ...(payment.gatewayResponse || {}), ...payload, callbackType: 'cancel' },
    });
    if (payment.invoiceId) {
      await this.invoiceRepo.update(payment.invoiceId, {
        status: 'cancelled',
        paymentStatus: PaymentStatus.UNPAID,
      });
    }

    return {
      success: false,
      message: 'Payment cancelled',
      data: { tranId },
    };
  }
}
