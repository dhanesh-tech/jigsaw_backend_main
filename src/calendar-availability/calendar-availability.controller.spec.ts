import { Test, TestingModule } from '@nestjs/testing';
import { CalendarAvailabilityController } from './calendar-availability.controller';

describe('CalendarAvailabilityController', () => {
  let controller: CalendarAvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarAvailabilityController],
    }).compile();

    controller = module.get<CalendarAvailabilityController>(CalendarAvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
