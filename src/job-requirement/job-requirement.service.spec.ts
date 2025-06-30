import { Test, TestingModule } from '@nestjs/testing';
import { JobRequirementService } from './job-requirement.service';

describe('JobRequirementService', () => {
  let service: JobRequirementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobRequirementService],
    }).compile();

    service = module.get<JobRequirementService>(JobRequirementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
