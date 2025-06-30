import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentResponseController } from './assessment-response.controller';

describe('AssessmentResponseController', () => {
  let controller: AssessmentResponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentResponseController],
    }).compile();

    controller = module.get<AssessmentResponseController>(AssessmentResponseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
