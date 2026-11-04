import { Test, TestingModule } from '@nestjs/testing';
import { DbConfigsService } from './db-configs.service';

describe('DbConfigsService', () => {
  let service: DbConfigsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbConfigsService],
    }).compile();

    service = module.get<DbConfigsService>(DbConfigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
