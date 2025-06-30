import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventDto } from './dto/calendar-event.dto';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import {
  CalendarEventCustomFieldDto,
  UpdateCalendarEventCustomFieldDto,
} from './dto/calendar-event-custom-field.dto';

/**
 * Controller for handling calendar events.
 */
@Controller('v1/calendar-events')
export class CalendarEventsController {
  /**
   * Creates an instance of CalendarEventsController.
   * @param calendarEventsService - The service to handle calendar events.
   */
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  /**
   * Creates a new calendar event.
   *
   * v1/calendar-events/
   * @param req - The request object containing user information.
   * @param calendarEventDto - The data transfer object for the calendar event.
   * @returns The created calendar event.
   */
  @Post('/')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  createCalendarEvent(
    @Req() req: any,
    @Body() calendarEventDto: CalendarEventDto,
  ) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.createCalendarEvent(
      calendarEventDto,
      +user_id,
    );
  }

  /**
   * Updates an existing calendar event.
   *
   * v1/calendar-events/:id
   * @param req - The request object containing user information.
   * @param calendarEventDto - The data transfer object for the calendar event.
   * @returns The updated calendar event.
   */
  @Put('/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  updateCalendarEvent(
    @Req() req: any,
    @Body() calendarEventDto: CalendarEventDto,
    @Param('id') id: number,
  ) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.updateCalendarEvent(
      +id,
      calendarEventDto,
      +user_id,
    );
  }

  /**
   * Removes a calendar event.
   *
   * v1/calendar-events/:id
   * @param req - The request object containing user information.
   * @returns The result of the removal operation.
   */
  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  removeCalendarEvent(@Req() req: any, @Param('id') id: number) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.removeCalendarEvent(+id, +user_id);
  }

  /**
   * Finds a calendar event by its ID.
   *
   * v1/calendar-events/:id
   * @param req - The request object containing user information.
   * @returns The calendar event with the specified ID.
   */
  @Get('/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  findOneEventById(@Req() req: any, @Param('id') id: number) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.findOneCalendarEvent(+id, +user_id);
  }

  /**
   * Finds all calendar events for the authenticated user.
   *
   * v1/calendar-events/
   * @param req - The request object containing user information.
   * @returns A list of all calendar events for the user.
   */
  @Get('')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  findAllCalendarEvents(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.findAllCalendarEvent(+user_id);
  }

  /**
   * Finds public details of a calendar event by its hash ID.
   *
   * v1/calendar-events/details/:hash_id
   * @param req - The request object containing the hash ID.
   * @returns The public details of the calendar event.
   */
  @Get('/details/:hash_id')
  @UseGuards(PublicAuthGuard)
  findPublicEventDetails(@Req() req: any, @Param('hash_id') hash_id: string) {
    return this.calendarEventsService.findPublicCalendarEvent(hash_id);
  }

  /**
   * Creates a new custom field for a calendar event.
   *
   * v1/calendar-events/:event_id/custom-fields
   * @param req - The request object containing user information.
   * @param customFieldDto - The data transfer object for the custom field.
   * @returns The created custom field.
   */
  @Post('/:event_id/custom-fields')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  createCustomField(
    @Req() req: any,
    @Body() customFieldDto: CalendarEventCustomFieldDto,
  ) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.createCustomField(
      customFieldDto,
      +user_id,
    );
  }

  /**
   * Updates an existing custom field for a calendar event.
   *
   * v1/calendar-events/:event_id/custom-fields/:id
   * @param req - The request object containing user information.
   * @param customFieldDto - The data transfer object for the custom field.
   * @returns The updated custom field.
   */
  @Put('/:event_id/custom-fields/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  updateCustomField(
    @Req() req: any,
    @Body() customFieldDto: UpdateCalendarEventCustomFieldDto,
    @Param('id') id: number,
  ) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.updateCustomField(
      +id,
      customFieldDto,
      +user_id,
    );
  }

  /**
   * Removes a custom field from a calendar event.
   *
   * v1/calendar-events/:event_id/custom-fields/:id
   * @param req - The request object containing user information.
   * @returns The result of the removal operation.
   */
  @Delete('/:event_id/custom-fields/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  removeCustomField(@Req() req: any, @Param('id') id: number) {
    const user_id = req?.user?.id;
    return this.calendarEventsService.removeCustomField(+id, +user_id);
  }

  /**
   * Finds all custom fields for a specific calendar event.
   *
   * v1/calendar-events/:event_id/custom-fields
   * @param req - The request object containing user information.
   * @returns A list of all custom fields for the event.
   */
  @Get('/:event_id/custom-fields')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  findAllCustomFields(@Req() req: any, @Param('event_id') event_id: number) {
    return this.calendarEventsService.findAllCustomFields(+event_id);
  }
}
