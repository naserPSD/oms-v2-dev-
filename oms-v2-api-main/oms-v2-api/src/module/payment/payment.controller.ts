import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@ApiTags('Payment')
@Controller('api/v1/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  private getFrontendUrl(): string {
    const frontendUrl =
      process.env.FRONTEND_URL?.toString().trim() || 'http://localhost:3000';

    return frontendUrl.replace(/\/$/, '');
  }

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Initiate SSLCOMMERZ payment for a subscription plan' })
  @HttpCode(HttpStatus.OK)
  async initiate(@Body() dto: InitiatePaymentDto, @Req() req: any) {
    const user = req.user;
    const result = await this.paymentService.initiatePayment(dto, user);

    return {
      status: 'success',
      message: 'Payment initiated successfully',
      data: result,
    };
  }

  @Public()
  @Post('success')
  @Get('success')
  @ApiOperation({ summary: 'SSLCOMMERZ success callback' })
  @HttpCode(HttpStatus.OK)
  async success(@Body() payload: any, @Query() query: any, @Res() response: any) {
    const combinedPayload = { ...query, ...payload };
    const tranId = combinedPayload.tran_id || combinedPayload.tranId || '';

    try {
      // 1. Process and validate payment immediately using the callback payload (val_id)
      const result = await this.paymentService.handleSuccessCallback(combinedPayload, true);
      const confirmedTranId = result.data?.tranId || tranId;

      return response.redirect(
        `${this.getFrontendUrl()}/subscription/success?tran_id=${encodeURIComponent(confirmedTranId)}&status=success`,
      );
    } catch (error) {
      // 2. Fallback verification via SSLCOMMERZ transaction query
      try {
        await this.paymentService.verifyTransaction(tranId);
        return response.redirect(
          `${this.getFrontendUrl()}/subscription/success?tran_id=${encodeURIComponent(tranId)}&status=success`,
        );
      } catch (fallbackError) {
        console.warn('SSLCOMMERZ success callback verification failed', {
          tranId,
          message: error instanceof Error ? error.message : String(error),
          fallbackMessage:
            fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError),
        });

        return response.redirect(
          `${this.getFrontendUrl()}/subscription/fail?tran_id=${encodeURIComponent(tranId)}&reason=verification_failed`,
        );
      }
    }
  }

  @Public()
  @Get('verify/:tranId')
  @ApiOperation({ summary: 'Verify an SSLCOMMERZ transaction and synchronize payment state' })
  @HttpCode(HttpStatus.OK)
  async verify(@Param('tranId') tranId: string) {
    return this.paymentService.verifyTransaction(tranId);
  }

  @Public()
  @Get('details/:identifier')
  @ApiOperation({ summary: 'Get detailed SSLCOMMERZ transaction and subscription plan summary' })
  @HttpCode(HttpStatus.OK)
  async details(@Param('identifier') identifier: string) {
    return this.paymentService.getTransactionDetails(identifier);
  }

  @Public()
  @Post('ipn')
  @Get('ipn')
  @ApiOperation({ summary: 'SSLCOMMERZ IPN notification' })
  @HttpCode(HttpStatus.OK)
  async ipn(@Body() payload: any, @Query() query: any) {
    const combinedPayload = { ...query, ...payload };
    const result = await this.paymentService.handleIpnCallback(combinedPayload);
    return result;
  }

  @Public()
  @Post('fail')
  @Get('fail')
  @ApiOperation({ summary: 'SSLCOMMERZ fail callback' })
  @HttpCode(HttpStatus.OK)
  async fail(@Body() payload: any, @Query() query: any, @Res() response: any) {
    const combinedPayload = { ...query, ...payload };
    const result = await this.paymentService.handleFailCallback(combinedPayload);
    const tranId = result.data?.tranId || combinedPayload.tran_id || combinedPayload.tranId || '';
    const reason =
      combinedPayload.error ||
      combinedPayload.failedreason ||
      'payment_failed';

    return response.redirect(
      `${this.getFrontendUrl()}/subscription/fail?tran_id=${encodeURIComponent(tranId)}&reason=${encodeURIComponent(reason)}`,
    );
  }

  @Public()
  @Post('cancel')
  @Get('cancel')
  @ApiOperation({ summary: 'SSLCOMMERZ cancel callback' })
  @HttpCode(HttpStatus.OK)
  async cancel(@Body() payload: any, @Query() query: any, @Res() response: any) {
    const combinedPayload = { ...query, ...payload };
    const result = await this.paymentService.handleCancelCallback(combinedPayload);
    const tranId = result.data?.tranId || combinedPayload.tran_id || combinedPayload.tranId || '';

    return response.redirect(
      `${this.getFrontendUrl()}/subscription/cancel?tran_id=${encodeURIComponent(tranId)}&status=cancelled`,
    );
  }
}
