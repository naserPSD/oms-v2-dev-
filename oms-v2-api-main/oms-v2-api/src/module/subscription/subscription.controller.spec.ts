import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: any;

  beforeEach(async () => {
    service = {
      findInvoiceById: jest.fn(),
      getInvoicePdfBuffer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('downloadInvoice', () => {
    it('downloads invoice PDF with correct headers and filename for valid numeric ID', async () => {
      const mockInvoice = { id: 1, invoiceNumber: 'INV-2026-001' } as any;
      const mockBuffer = Buffer.from('%PDF-1.4 test pdf content');

      service.findInvoiceById.mockResolvedValue(mockInvoice);
      service.getInvoicePdfBuffer.mockResolvedValue(mockBuffer);

      const res: any = {
        set: jest.fn(),
        end: jest.fn(),
      };

      await controller.downloadInvoice('1', res);

      expect(service.findInvoiceById).toHaveBeenCalledWith(1, true);
      expect(service.getInvoicePdfBuffer).toHaveBeenCalledWith(mockInvoice);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="invoice-1.pdf"',
        'Content-Length': mockBuffer.length.toString(),
        'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length',
      });
      expect(res.end).toHaveBeenCalledWith(mockBuffer);
    });

    it('throws BadRequestException if invoice ID is not numeric', async () => {
      const res: any = { set: jest.fn(), end: jest.fn() };

      await expect(controller.downloadInvoice('abc', res)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.downloadInvoice('-5', res)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
