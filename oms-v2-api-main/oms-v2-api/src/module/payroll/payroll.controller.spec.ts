import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

describe('PayrollController', () => {
  let controller: PayrollController;

  const mockPayrollService = {
    // Add mock methods as needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        {
          provide: PayrollService,
          useValue: mockPayrollService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PayrollController>(PayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
