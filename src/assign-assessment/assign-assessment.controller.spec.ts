import { Test, TestingModule } from '@nestjs/testing';
import { AssignAssessmentController } from './assign-assessment.controller';

describe('AssignAssessmentController', () => {
  let controller: AssignAssessmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignAssessmentController],
    }).compile();

    controller = module.get<AssignAssessmentController>(AssignAssessmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
