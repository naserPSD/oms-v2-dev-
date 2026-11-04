import { Test, TestingModule } from '@nestjs/testing';
import { HrManagementController } from './hr-management.controller';
import { HrManagementService } from './hr-management.service';

describe('HrManagementController', () => {
  let controller: HrManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrManagementController],
      providers: [HrManagementService],
    }).compile();

    controller = module.get<HrManagementController>(HrManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
