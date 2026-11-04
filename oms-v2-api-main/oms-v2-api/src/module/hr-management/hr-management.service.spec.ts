import { Test, TestingModule } from '@nestjs/testing';
import { HrManagementService } from './hr-management.service';

describe('HrManagementService', () => {
  let service: HrManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HrManagementService],
    }).compile();

    service = module.get<HrManagementService>(HrManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
