import { Test, TestingModule } from '@nestjs/testing';
import { InitialSetupController } from './initial-setup.controller';
import { InitialSetupService } from './initial-setup.service';

describe('InitialSetupController', () => {
  let controller: InitialSetupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitialSetupController],
      providers: [InitialSetupService],
    }).compile();

    controller = module.get<InitialSetupController>(InitialSetupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
