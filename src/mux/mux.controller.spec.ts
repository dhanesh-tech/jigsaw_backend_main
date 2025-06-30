import { Test, TestingModule } from '@nestjs/testing';
import { MuxController } from './mux.controller';

describe('MuxController', () => {
  let controller: MuxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MuxController],
    }).compile();

    controller = module.get<MuxController>(MuxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
