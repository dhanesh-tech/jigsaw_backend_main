import { Test, TestingModule } from '@nestjs/testing';
import { CalendarScheduledEventRatingController } from './calendar-scheduled-event-rating.controller';

describe('CalendarScheduledEventRatingController', () => {
  let controller: CalendarScheduledEventRatingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarScheduledEventRatingController],
    }).compile();

    controller = module.get<CalendarScheduledEventRatingController>(
      CalendarScheduledEventRatingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
