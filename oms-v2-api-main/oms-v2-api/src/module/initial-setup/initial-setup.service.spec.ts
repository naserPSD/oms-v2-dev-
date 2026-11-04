import { Test, TestingModule } from '@nestjs/testing';
import { InitialSetupService } from './initial-setup.service';

describe('InitialSetupService', () => {
  let service: InitialSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitialSetupService],
    }).compile();

    service = module.get<InitialSetupService>(InitialSetupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
