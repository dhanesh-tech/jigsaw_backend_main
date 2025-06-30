import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentResponseService } from './assessment-response.service';

describe('AssessmentResponseService', () => {
  let service: AssessmentResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentResponseService],
    }).compile();

    service = module.get<AssessmentResponseService>(AssessmentResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
