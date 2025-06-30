import { Controller, Req, UseGuards } from '@nestjs/common';
import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CalendarAvailabilityService } from './calendar-availability.service';
import { CalendarAvailabilityDto } from './dto/calendar-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import {
  CalendarAvailabilityTimingDto,
  DateSpecificAvailabilityDto,
} from './dto/calendar-availability-timing.dto';
import { CalendarAvailabilityEventDto } from './dto/calendar-availability-event.dto';

@Controller('/v1/calendar-availability')
export class CalendarAvailabilityController {
  constructor(
    private readonly calendarAvailabilityService: CalendarAvailabilityService,
  ) {}

  /**
   * Create a new calendar availability entry.
   *
   * /v1/calendar-availability
   * @param calendarAvailabilityDto - The data transfer object containing the availability details.
   * @param req - The request object containing user information.
   * @returns The created calendar availability entry.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  createAvailability(
    @Body() calendarAvailabilityDto: CalendarAvailabilityDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.createAvailability(
      calendarAvailabilityDto,
      user_id,
    );
  }

  /**
   * Retrieve all calendar availability entries for the authenticated user.
   *
   * /v1/calendar-availability
   * @param req - The request object containing user information.
   * @returns A list of calendar availability entries for the user.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  findAllAvailability(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.findAllAvailability(user_id);
  }

  /**
   * Retrieve a specific calendar availability entry by ID for the authenticated user.
   *
   * /v1/calendar-availability/:id
   * @param id - The ID of the calendar availability entry.
   * @param req - The request object containing user information.
   * @returns The calendar availability entry with the specified ID for the user.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  findOneAvailability(@Param('id') id: string, @Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.findOneAvailability(+id, user_id);
  }

  /**
   * Retrieve all calendar availability entries for a specific user by user_hash_id.
   *
   * /v1/calendar-availability/all/:user_hash_id
   * @param user_hash_id - The hash ID of the user.
   * @param req - The request object containing user information.
   * @returns A list of calendar availability entries for the specified user.
   */
  @Get('all/:user_hash_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  findAvailabilityByUserHashId(@Param('user_hash_id') user_hash_id: string) {
    return this.calendarAvailabilityService.findAvailabilityByUserHashId(
      user_hash_id,
    );
  }

  /**
   * Update a specific calendar availability entry by ID for the authenticated user.
   *
   * /v1/calendar-availability/:id
   * @param id - The ID of the calendar availability entry.
   * @param calendarAvailabilityDto - The data transfer object containing the updated availability details.
   * @param req - The request object containing user information.
   * @returns The updated calendar availability entry.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  updateAvailability(
    @Param('id') id: string,
    @Body() calendarAvailabilityDto: CalendarAvailabilityDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.updateAvailability(
      +id,
      calendarAvailabilityDto,
      user_id,
    );
  }

  /**
   * Remove a specific calendar availability entry by ID for the authenticated user.
   *
   * /v1/calendar-availability/:id
   * @param id - The ID of the calendar availability entry.
   * @param req - The request object containing user information.
   * @returns A confirmation message indicating the removal status.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  removeAvailability(@Param('id') id: string, @Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.removeAvailability(+id, user_id);
  }

  /**
   * Add a new timing to a specific calendar availability entry by availability_id for the authenticated user.
   *
   * /v1/calendar-availability/:availability_id/timing
   * @param availability_id - The ID of the calendar availability entry.
   * @param timingDto - The data transfer object containing the timing details.
   * @param req - The request object containing user information.
   * @returns The updated calendar availability entry with the new timing.
   */
  @Post(':availability_id/timing')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  addAvailabilityTiming(
    @Param('availability_id') availability_id: string,
    @Body() timingDto: CalendarAvailabilityTimingDto[],
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.addAvailabilityTiming(
      timingDto,
      +availability_id,
      user_id,
    );
  }

  /**
   * Update a specific timing of a calendar availability entry by availability_id for the authenticated user.
   *
   * /v1/calendar-availability/:availability_id/timing/:timing_id
   * @param availability_id - The ID of the calendar availability entry.
   * @param timing_id - The ID of the timing entry.
   * @param timingDto - The data transfer object containing the updated timing details.
   * @param req - The request object containing user information.
   * @returns The updated calendar availability entry with the updated timing.
   */
  @Put(':availability_id/timing/:timing_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  updateAvailabilityTiming(
    @Param('availability_id') availability_id: string,
    @Param('timing_id') timing_id: string,
    @Body() timingDto: CalendarAvailabilityTimingDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.updateAvailabilityTiming(
      +timing_id,
      timingDto,
      +availability_id,
      user_id,
    );
  }

  /**
   * Remove a specific timing from a calendar availability entry by availability_id for the authenticated user.
   *
   * /v1/calendar-availability/:availability_id/timing/:timing_id
   * @param availability_id - The ID of the calendar availability entry.
   * @param timing_id - The ID of the timing entry.
   * @param req - The request object containing user information.
   * @returns A confirmation message indicating the removal status.
   */
  @Delete(':availability_id/timing/:timing_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  removeAvailabilityTiming(
    @Param('availability_id') availability_id: string,
    @Param('timing_id') timing_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.removeAvailabilityTiming(
      +timing_id,
      +availability_id,
      user_id,
    );
  }

  /**
   * Assign an event to a specific calendar availability entry by ID for the authenticated user.
   *
   * /v1/calendar-availability/event/assign
   * @param eventDto - The data transfer object containing the event details.
   * @param req - The request object containing user information.
   * @returns The updated calendar availability entry with the assigned event.
   */
  @Post('/event/assign')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  assignEventToAvailability(
    @Body() eventDto: CalendarAvailabilityEventDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.assignEventToAvailability(
      eventDto,
      user_id,
    );
  }

  /**
   * Assign an event to a specific calendar availability entry by ID for the authenticated user.
   *
   * /v1/calendar-availability/event/assign/:id
   * @param id - The ID of the calendar availability entry.
   * @param req - The request object containing user information.
   * @returns The updated calendar availability entry with the assigned event.
   */
  @Delete('/event/assign/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  removeAvailabilityEvent(@Param('id') id: string, @Req() req: any) {
    const user_id = req?.user?.id;
    return this.calendarAvailabilityService.removeAvailabilityEvent(
      +id,
      +user_id,
    );
  }

  /**
   * Retrieve all available slots for a specific calendar availability entry by hash_id for the authenticated user.
   *
   * /v1/calendar-availability/available-slots/:hash_id
   * @param hash_id - The hash ID of the calendar availability entry.
   * @param req - The request object containing user information.
   * @returns A list of available slots for the specified calendar availability entry.
   */
  @Post('available-slots/:hash_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.candidate,
  )
  findAllAvailableSlots(
    @Param('hash_id') hash_id: string,
    @Req() req: any,
    @Body() dateDto: DateSpecificAvailabilityDto,
  ) {
    const user_details = req?.user;
    return this.calendarAvailabilityService.findAllAvailableSlots(
      hash_id,
      dateDto,
      user_details,
    );
  }
}
