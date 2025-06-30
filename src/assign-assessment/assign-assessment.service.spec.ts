import { Test, TestingModule } from '@nestjs/testing';
import { AssignAssessmentService } from './assign-assessment.service';

describe('AssignAssessmentService', () => {
  let service: AssignAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignAssessmentService],
    }).compile();

    service = module.get<AssignAssessmentService>(AssignAssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
