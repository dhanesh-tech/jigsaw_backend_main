import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { CalendarScheduleEventRatingDto } from './dto/calendar-scheduled-event-rating.dto';
import { CalendarScheduledEventRatingService } from './calendar-scheduled-event-rating.service';

@Controller('v1/scheduled-event-rating')
export class CalendarScheduledEventRatingController {
  constructor(
    private readonly interviewRatingService: CalendarScheduledEventRatingService,
  ) {}
  /**
   * Rates a scheduled event.
   *
   * /v1/schedule-event/rate/:scheduled_event_id
   * @param scheduled_event_id - The ID of the scheduled event.
   * @param ratingDto - The rating details.
   * @param req - The request object containing user information.
   * @returns The details of the rated event.
   */
  @Post('/rate/:scheduled_event_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  async rateScheduledInterview(
    @Param('scheduled_event_id') scheduled_event_id: number,
    @Body() ratingDto: CalendarScheduleEventRatingDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.interviewRatingService.rateScheduledInterview(
      scheduled_event_id,
      ratingDto,
      user_id,
    );
  }
}
