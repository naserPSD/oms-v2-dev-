import { Test, TestingModule } from '@nestjs/testing';
import { StatusGroupController } from './status-group.controller';
import { StatusGroupService } from './status-group.service';

describe('StatusGroupController', () => {
  let controller: StatusGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusGroupController],
      providers: [StatusGroupService],
    }).compile();

    controller = module.get<StatusGroupController>(StatusGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
