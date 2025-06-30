import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentsController } from './ai-agents.controller';

describe('AiAgentsController', () => {
  let controller: AiAgentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAgentsController],
    }).compile();

    controller = module.get<AiAgentsController>(AiAgentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
