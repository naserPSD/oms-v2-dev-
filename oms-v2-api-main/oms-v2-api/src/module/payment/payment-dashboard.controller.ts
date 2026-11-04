import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { PaymentDashboardQueryDto } from './dto/payment-dashboard-query.dto';
import { PaymentDashboardService } from './payment-dashboard.service';

@ApiTags('Admin Payment Dashboard')
@ApiBearerAuth('access_token')
@Controller('api/v1/admin/payment-dashboard')
@UseGuards(JwtAuthGuard)
export class PaymentDashboardController {
  constructor(private readonly service: PaymentDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get admin payment and revenue overview' })
  overview(@Query() query: PaymentDashboardQueryDto) { return this.service.overview(query); }

  @Get('revenue-trend')
  @ApiOperation({ summary: 'Get revenue trend grouped by day, week, or month' })
  revenueTrend(@Query() query: PaymentDashboardQueryDto) { return this.service.revenueTrend(query); }

  @Get('subscription-sales')
  @ApiOperation({ summary: 'Get successful sales grouped by subscription plan' })
  subscriptionSales(@Query() query: PaymentDashboardQueryDto) { return this.service.subscriptionSales(query); }

  @Get('transactions')
  @ApiOperation({ summary: 'List payment transactions for administrators' })
  transactions(@Query() query: PaymentDashboardQueryDto) { return this.service.transactions(query); }

  @Get('payment-statistics')
  @ApiOperation({ summary: 'Get payment status statistics' })
  paymentStatistics(@Query() query: PaymentDashboardQueryDto) { return this.service.paymentStatistics(query); }

  @Get('subscription-statistics')
  @ApiOperation({ summary: 'Get subscription lifecycle statistics' })
  subscriptionStatistics(@Query() query: PaymentDashboardQueryDto) { return this.service.subscriptionStatistics(query); }

  @Get('export')
  @ApiOperation({ summary: 'Export up to 100 filtered payment transactions as CSV' })
  async export(@Query() query: PaymentDashboardQueryDto, @Res() response: Response) {
    const csv = await this.service.exportCsv(query);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="payment-transactions.csv"');
    return response.send(csv);
  }
}