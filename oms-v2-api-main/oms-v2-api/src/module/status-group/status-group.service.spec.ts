import { Test, TestingModule } from '@nestjs/testing';
import { StatusGroupService } from './status-group.service';

describe('StatusGroupService', () => {
  let service: StatusGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusGroupService],
    }).compile();

    service = module.get<StatusGroupService>(StatusGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
