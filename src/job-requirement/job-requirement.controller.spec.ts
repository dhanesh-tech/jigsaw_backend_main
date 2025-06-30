import { Test, TestingModule } from '@nestjs/testing';
import { JobRequirementController } from './job-requirement.controller';
import { JobRequirementService } from './job-requirement.service';

describe('JobRequirementController', () => {
  let controller: JobRequirementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobRequirementController],
      providers: [JobRequirementService],
    }).compile();

    controller = module.get<JobRequirementController>(JobRequirementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
