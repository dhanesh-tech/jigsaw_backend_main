import { Test, TestingModule } from '@nestjs/testing';
import { CalendarScheduledInterviewController } from './calendar-scheduled-event.controller';

describe('CalendarScheduledInterviewController', () => {
  let controller: CalendarScheduledInterviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarScheduledInterviewController],
    }).compile();

    controller = module.get<CalendarScheduledInterviewController>(CalendarScheduledInterviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
