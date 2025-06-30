import { Test, TestingModule } from '@nestjs/testing';
import { CalendarScheduledEventRatingService } from './calendar-scheduled-event-rating.service';

describe('CalendarScheduledEventRatingService', () => {
  let service: CalendarScheduledEventRatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarScheduledEventRatingService],
    }).compile();

    service = module.get<CalendarScheduledEventRatingService>(
      CalendarScheduledEventRatingService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
