import { Test, TestingModule } from '@nestjs/testing';
import { HmsService } from './hms.service';

describe('HmsService', () => {
  let service: HmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HmsService],
    }).compile();

    service = module.get<HmsService>(HmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
