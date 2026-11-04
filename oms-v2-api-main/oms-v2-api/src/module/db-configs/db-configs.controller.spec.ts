import { Test, TestingModule } from '@nestjs/testing';
import { DbConfigsController } from './db-configs.controller';
import { DbConfigsService } from './db-configs.service';

describe('DbConfigsController', () => {
  let controller: DbConfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbConfigsController],
      providers: [DbConfigsService],
    }).compile();

    controller = module.get<DbConfigsController>(DbConfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
