import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Header,
  StreamableFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { SubscriptionService } from './subscription.service';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Helpers } from '@core/utils/helpers';
import { Subscription } from './entities/subscription.entity';
import {
  CreateSubscriptionPlanDto,
  SubscriptionPlanResponseDto,
} from './dto/subscription-plan.dto';
import { CreateSubscriptionDto, SubscribeDto } from './dto/subscriptions.dto';
import { CreateCouponDto } from './dto/coupons.dto';
import { CreateSubscriptionInvoiceDto } from './dto/subscription-invoices.dto';
import { CreateInvoiceDto, InvoiceResponseDto } from './dto/invoices.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Subscription ')
@Controller('api/v1/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('/subscription-plans/add-or-update')
  @ApiOperation({ summary: 'Create or update a subscription plan' })
  @ApiResponse({ status: 200, type: SubscriptionPlanResponseDto })
  async createOrUpdate(@Body() dto: CreateSubscriptionPlanDto) {
    const plan =
      await this.subscriptionService.createOrUpdateSubscriptionPlan(dto);
    return {
      status: 'success',
      message: 'Subscription Plan saved successfully',
      data: SubscriptionPlanResponseDto.fromEntity(plan),
    };
  }

  @Get('/subscription-plans/get-all-list')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Plan name" }',
    example: '{ "search": "Premium Plan" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async getAll(@Query() query: any) {
    const queryResult =
      await this.subscriptionService.findAllSubscriptionPlans(query);

    return {
      status: 'success',
      message: 'Subscription plans retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/subscription-plans/get-by-id/:id')
  @ApiOperation({ summary: 'Get a subscription plan by ID' })
  async getById(@Param('id') id: string) {
    const plan = await this.subscriptionService.findSubscriptionPlanById(+id);
    return {
      status: 'success',
      message: 'Subscription Plan retrieved successfully',
      data: plan,
    };
  }

  @Delete('/subscription-plans/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete a subscription plan' })
  async delete(@Param('id') id: string) {
    await this.subscriptionService.deleteSubscriptionPlan(+id);
    return {
      status: 'success',
      message: 'Subscription Plan deleted successfully',
    };
  }

  @Patch('/subscription-plans/change-active-status/:id')
  @ApiOperation({ summary: 'Change Active Status' })
  async changeSubscriptionPlanActiveStatus(@Param('id') id: string) {
    const result =
      await this.subscriptionService.changeSubscriptionPlanActiveStatus(+id);
    return {
      status: 'success',
      message: 'Subscription plan active status changed successfully',
      data: result,
    };
  }

  @Patch('/subscription-plans/change-popular-status/:id')
  @ApiOperation({ summary: 'Change Popular Status' })
  async changeSubscriptionPlanPopularStatus(@Param('id') id: string) {
    const result =
      await this.subscriptionService.changeSubscriptionPlanPopularStatus(+id);
    return {
      status: 'success',
      message: 'Subscription plan popular status changed successfully',
      data: result,
    };
  }

  //add or update subscriptions

  @Post('/add-or-update-subscription')
  @ApiOperation({ summary: 'Add or Update Subscription' })
  async addOrUpdateSubscription(@Body() dto: CreateSubscriptionDto) {
    const subscription =
      await this.subscriptionService.createOrUpdateSubscription(dto);

    return {
      status: 'success',
      message: `Subscription ${dto.id ? 'updated' : 'added'} successfully`,
      data: subscription,
    };
  }

  @Post('/subscribe')
  @ApiOperation({ summary: 'Subscribe the authenticated user to a plan' })
  async subscribe(@Body() dto: SubscribeDto) {
    const subscription = await this.subscriptionService.subscribe(dto);

    return {
      status: 'success',
      message: 'Subscription added successfully',
      data: subscription,
    };
  }

  @Get('/get-all-subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Plan name" }',
    example: '{ "search": "Basic Plan" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async getAllSubscriptions(@Query() query: any) {
    const queryResult =
      await this.subscriptionService.findAllSubscriptions(query);

    return {
      status: 'success',
      message: 'Subscriptions retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-subscription-by-id/:id')
  @ApiOperation({ summary: 'Get a subscription by ID' })
  async getSubscriptionById(@Param('id') id: string) {
    const subscription =
      await this.subscriptionService.findSubscriptionById(+id);

    return {
      status: 'success',
      message: 'Subscription retrieved successfully',
      data: subscription,
    };
  }

  @Delete('/delete-subscription/:id')
  @ApiOperation({ summary: 'Delete a subscription' })
  async deleteSubscription(@Param('id') id: string) {
    await this.subscriptionService.deleteSubscription(+id);

    return {
      status: 'success',
      message: 'Subscription deleted successfully',
    };
  }

  //only add invoices
  @Post('/add-subscription-invoice')
  @ApiOperation({ summary: 'Add Subscription Invoice' })
  async addInvoice(@Body() dto: CreateSubscriptionInvoiceDto) {
    const invoice =
      await this.subscriptionService.createSubscriptionInvoice(dto);

    return {
      status: 'success',
      message: 'Subscription Invoice added successfully',
      data: invoice,
    };
  }

  @Get('/get-all-subscription-invoices')
  @ApiOperation({ summary: 'Get all subscription invoices' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Invoice" }',
    example: '{ "search": "INV-001" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async findAllSubscriptionInvoices(@Query() query: any) {
    const queryResult =
      await this.subscriptionService.findAllSubscriptionInvoices(query);

    return {
      status: 'success',
      message: 'Subscription invoices retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-subscription-invoice-by-id/:id')
  @ApiOperation({ summary: 'Get a subscription invoice by ID' })
  async getInvoiceById(@Param('id') id: string) {
    const invoice =
      await this.subscriptionService.findSubscriptionInvoiceById(+id);
    return {
      status: 'success',
      message: 'Subscription invoice retrieved successfully',
      data: invoice,
    };
  }

  @Delete('/delete-subscription-invoice/:id')
  @ApiOperation({ summary: 'Delete a subscription invoice' })
  async deleteInvoice(@Param('id') id: string) {
    await this.subscriptionService.deleteSubscriptionInvoice(+id);
    return {
      status: 'success',
      message: 'Subscription invoice deleted successfully',
    };
  }

  //add or update coupons
  @Post('/add-or-update-coupon')
  @ApiOperation({ summary: 'Add or Update Coupon' })
  async addOrUpdateCoupon(@Body() dto: CreateCouponDto) {
    const coupon = await this.subscriptionService.createOrUpdateCoupon(dto);
    return {
      status: 'success',
      message: `Coupon ${dto.id ? 'updated' : 'added'} successfully`,
      data: coupon,
    };
  }

  //get all coupons

  @Get('/get-all-coupons')
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Coupon" }',
    example: '{ "search": "COUPON-001" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async getAllCoupons(@Query() query: any) {
    const queryResult = await this.subscriptionService.findAllCoupons(query);
    return {
      status: 'success',
      message: 'Coupons retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // get coupon by id
  @Get('/get-coupon-by-id/:id')
  @ApiOperation({ summary: 'Get a coupon by ID' })
  async getCouponById(@Param('id') id: string) {
    const coupon = await this.subscriptionService.findCouponById(+id);
    return {
      status: 'success',
      message: 'Coupon retrieved successfully',
      data: coupon,
    };
  }

  // delete coupon
  @Delete('/delete-coupon/:id')
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@Param('id') id: string) {
    await this.subscriptionService.deleteCoupon(+id);
    return {
      status: 'success',
      message: 'Coupon deleted successfully',
    };
  }

  // toggle coupon status
  @Patch('/change-coupon-status/:id')
  @ApiOperation({ summary: 'Toggle coupon active status' })
  async toggleCouponStatus(@Param('id') id: string) {
    const coupon = await this.subscriptionService.toggleCouponStatus(+id);
    return {
      status: 'success',
      message: 'Coupon status changed successfully',
      data: coupon,
    };
  }

  // validate coupon
  @Post('/validate-coupon')
  @ApiOperation({ summary: 'Validate coupon for subscription offer' })
  async validateCoupon(
    @Body() body: { code: string; planId?: number; billingCycle?: string },
  ) {
    const result = await this.subscriptionService.validateCoupon(
      body?.code,
      body?.planId,
      body?.billingCycle,
    );
    return {
      status: result.isValid ? 'success' : 'error',
      ...result,
    };
  }

  @Public()
  @Get('/get-all-active-subscription-plans')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  async getAllSubscriptionPlans(@Query() query: any) {
    const queryResult =
      await this.subscriptionService.findAllActiveSubscriptionPlans(query);

    return {
      status: 'success',
      message: 'Active subscription plans retrieved successfully',
      data: queryResult.data,
    };
  }

  @Post('/invoices/add-or-update')
  @ApiOperation({ summary: 'Create or update invoice' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async createOrUpdateInvoice(@Body() dto: CreateInvoiceDto) {
    const invoice = await this.subscriptionService.createOrUpdateInvoice(dto);

    return {
      status: 'success',
      message: 'Invoice saved successfully',
      data: InvoiceResponseDto.fromEntity(invoice),
    };
  }

  @Get('/get-all-invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters',
    example: '{ "search": "INV-001" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results, e.g., id:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields (comma separated)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  async getAllInvoices(@Query() query: any) {
    const queryResult = await this.subscriptionService.findAllInvoices(query);

    return {
      status: 'success',
      message: 'Invoices retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Delete('/invoices/:id')
  @ApiOperation({ summary: 'Delete an invoice by ID' })
  async deleteInvoiceById(@Param('id') id: string) {
    await this.subscriptionService.deleteInvoiceById(+id);
    return {
      status: 'success',
      message: 'Invoice deleted successfully',
    };
  }

  @Get('/invoices/:id/download')
  @ApiOperation({ summary: 'Download an invoice as PDF' })
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const numericId = Number(id);
    if (
      !id ||
      isNaN(numericId) ||
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      throw new BadRequestException('Invoice ID must be a numeric ID');
    }
    const invoice = await this.subscriptionService.findInvoiceById(
      numericId,
      true,
    );
    const fileName = `invoice-${invoice.id}.pdf`;
    const pdfBuffer =
      await this.subscriptionService.getInvoicePdfBuffer(invoice);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length.toString(),
      'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length',
    });

    res.end(pdfBuffer);
  }

  @Get('/payments/payment-history')
  @ApiOperation({ summary: 'Get subscription payment history' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters',
    example: '{ "search": "INV-001" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results, e.g., paidAt:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields (comma separated)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  async getPaymentHistory(@Query() query: any) {
    const queryResult = await this.subscriptionService.findAllInvoices(
      query,
      true,
    );
    const data = queryResult.data.map((invoice: any) => {
      const plan =
        invoice.plan ??
        invoice.subscriptionPlan ??
        invoice.subscription?.plan ??
        null;
      const transactionId =
        invoice.transactionId ??
        invoice.tranId ??
        invoice.paymentTransactions?.[0]?.tranId ??
        null;

      return {
        ...invoice,
        plan,
        planName: invoice.planName ?? plan?.name ?? null,
        subscriptionPlan: plan,
        transactionId,
        tranId: transactionId,
      };
    });

    return {
      status: 'success',
      message: 'Payment history retrieved successfully',
      data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/current-company-subscription')
  @ApiOperation({
    summary: 'Get current company subscription details and trial status',
  })
  async getCurrentCompanySubscription() {
    const data = await this.subscriptionService.getCurrentCompanySubscription();
    return {
      status: 'success',
      message: 'Current company subscription retrieved successfully',
      data,
    };
  }

  @Get('/subscriber-companies')
  @ApiOperation({
    summary:
      'Get all subscriber registered companies with subscription and user info',
  })
  async getSubscriberCompanies(@Query() query: any) {
    const result = await this.subscriptionService.getSubscriberCompanies(query);
    return {
      message: 'Subscriber companies retrieved successfully',
      data: result.data,
      summary: result.summary,
      pagination: result.pagination,
    };
  }

  @Patch('/subscriber-companies/:id/toggle-status')
  @ApiOperation({
    summary: 'Toggle company active/deactive status for Super Admin',
  })
  async toggleCompanyStatus(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean },
  ) {
    return this.subscriptionService.toggleCompanyStatus(+id, body?.isActive);
  }

  @Get('/subscriber-companies/:id/purchase-history')
  @ApiOperation({
    summary: 'Get all purchase and billing history of a subscriber company',
  })
  async getCompanyPurchaseHistory(@Param('id') id: string) {
    const result =
      await this.subscriptionService.getCompanyPurchaseHistory(+id);
    return {
      message: 'Company purchase history retrieved successfully',
      data: result.data,
    };
  }
}
