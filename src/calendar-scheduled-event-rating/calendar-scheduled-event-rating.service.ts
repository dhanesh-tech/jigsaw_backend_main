import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalendarScheduleEventRatingDto } from './dto/calendar-scheduled-event-rating.dto';
import { CalendarScheduledInterviewRating } from './entities/calendar-scheduled-event-rating.entity';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED } from 'src/_jigsaw/constants';
import { CalendarScheduledInterview } from 'src/calendar-scheduled-event/entities/calendar-scheduled-interview.entity';

@Injectable()
export class CalendarScheduledEventRatingService {
  constructor(
    @InjectRepository(CalendarScheduledInterview)
    private scheduleEventRepository: Repository<CalendarScheduledInterview>,

    @InjectRepository(CalendarScheduledInterviewRating)
    private interviewRatingRepository: Repository<CalendarScheduledInterviewRating>,
  ) {}

  /**
   * Rates a completed scheduled interview.
   *
   * @param scheduled_event_id - The ID of the scheduled event to be rated.
   * @param ratingDto - Data Transfer Object containing the rating details.
   * @param user_id - The ID of the user providing the rating.
   * @returns The saved rating for the scheduled interview.
   */
  async rateScheduledInterview(
    scheduled_event_id: number,
    ratingDto: CalendarScheduleEventRatingDto,
    user_id: number,
  ): Promise<CalendarScheduledInterviewRating> {
    // Fetch the scheduled event from the repository
    const event = await this.scheduleEventRepository.findOne({
      where: { id: scheduled_event_id },
      relations: ['organiser_id', 'joinee_id'],
    });

    if (!event) {
      throw new HttpException(
        SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED,
        HttpStatus.NOT_FOUND,
      );
    }

    // Ensure the user is either the organiser or the joinee
    if (event.organiser_id.id !== user_id && event.joinee_id.id !== user_id) {
      throw new HttpException(
        SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // create a new rating
    const newRating = await this.interviewRatingRepository.create({
      ...ratingDto,
      rated_by_id: { id: user_id },
      scheduled_interview_id: { id: scheduled_event_id },
    });

    // Save the updated event to the repository
    const savedRating = await this.interviewRatingRepository.save(newRating);

    return classSerialiser(CalendarScheduledInterviewRating, savedRating);
  }
}
