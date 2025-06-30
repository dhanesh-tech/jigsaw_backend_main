import { Test, TestingModule } from '@nestjs/testing';
import { HmsController } from './hms.controller';

describe('HmsController', () => {
  let controller: HmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HmsController],
    }).compile();

    controller = module.get<HmsController>(HmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
