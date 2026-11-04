import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 1, description: 'Subscription plan ID' })
  @Transform(({ value }) =>
    value === null || value === undefined || value === '' || Number.isNaN(Number(value))
      ? value
      : Number(value),
  )
  @IsInt()
  @IsPositive()
  subscriptionPlanId: number;

  @ApiPropertyOptional({
    example: 'yearly',
    description: 'Billing cycle chosen on the plans page (monthly or yearly)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'yearly', 'Monthly', 'Yearly'])
  billingCycle?: string;
}
