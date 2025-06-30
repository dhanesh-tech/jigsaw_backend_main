import { Test, TestingModule } from '@nestjs/testing';
import { CalendarScheduledInterviewService } from './calendar-scheduled-event.service';

describe('CalendarScheduledInterviewService', () => {
  let service: CalendarScheduledInterviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarScheduledInterviewService],
    }).compile();

    service = module.get<CalendarScheduledInterviewService>(
      CalendarScheduledInterviewService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
