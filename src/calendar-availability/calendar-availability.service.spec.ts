import { Test, TestingModule } from '@nestjs/testing';
import { CalendarAvailabilityService } from './calendar-availability.service';

describe('CalendarAvailabilityService', () => {
  let service: CalendarAvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarAvailabilityService],
    }).compile();

    service = module.get<CalendarAvailabilityService>(
      CalendarAvailabilityService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
