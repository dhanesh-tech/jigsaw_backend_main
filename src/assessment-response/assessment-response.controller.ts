import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { AssessmentResponseService } from './assessment-response.service';
import { UpdateAssessmentCandidateResponseDto } from './dto/assessmentCandidateResponse.dto';
import { UpdateAssessmentCandidateResponseRatingDto } from './dto/assessmentCandidateResponseRating.dto';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import { AssessmentCandidateResponse } from './entities/assessmentCandidateResponse.entity';
import { AssessmentCandidateResponseRating } from './entities/assessmentCandidateResponseRating.entity';

@Controller('v1/assessment-kits/assessment-response')
export class AssessmentResponseController {
  constructor(
    private readonly assessmentResponseService: AssessmentResponseService,
  ) {}
  // v1/assessment-kits/assessment-response/next-question/:assessment_id -> fetch the next question of the assessment kit
  @Get('/next-question/:assessment_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  fetchNextAssessmentQuestion(
    @Param('assessment_id') assessment_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.fetchNextAssessmentKitQuestion(
      +assessment_id,
      user_id,
    );
  }

  // v1/assessment-kits/assessment-response/save/:assigned_question_id -> save the response of a candidate on the assigned question
  @Post('/save/:assigned_question_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  saveCandidateQuestionResponse(
    @Param('assigned_question_id') assigned_question_id: string,
    @Req() req: any,
    @Body() data: UpdateAssessmentCandidateResponseDto,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.saveCandidateQuestionResponse(
      +assigned_question_id,
      user_id,
      data,
    );
  }

  // v1/assessment-kits/assessment-response/saved/:assessment_id/:candidate_id -> fetch all responses of one candidate  on an assessment kit
  @Get('/saved/:assessment_id/:candidate_id')
  @UseGuards(PublicAuthGuard)
  getCandidateAssessmentResponse(
    @Param('assessment_id') assessment_id: string,
    @Param('candidate_id') candidate_id: string,
  ) {
    return this.assessmentResponseService.getCandidateAssessmentResponse(
      +assessment_id,
      +candidate_id,
    );
  }

  // v1/assessment-kits/assessment-response/rate -> create the ratings and comment of an assigned question
  @Post('/rate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  createQuestionResponseRating(
    @Body() rating: UpdateAssessmentCandidateResponseRatingDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.createCandidateQuestionResponseRating(
      +user_id,
      rating,
    );
  }

  // v1/assessment-kits/assessment-response/rate/:rating_id -> update the ratings and comment of an assigned question
  @Put('/rate/:rating_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  updateQuestionResponseRating(
    @Param('rating_id') rating_id: string,
    @Req() req: any,
    @Body() rating: UpdateAssessmentCandidateResponseRatingDto,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.updateCandidateQuestionResponseRating(
      +rating_id,
      +user_id,
      rating,
    );
  }

  /**
   * Fetches the next profile assessment question for the user.
   * /v1/assessment-kits/assessment-response/profile/next-question
   * @param req - The request object containing user information.
   * @returns A promise that resolves to the next profile assessment question.
   */
  @Get('/profile/next-question')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  fetchNextProfileQuestion(@Req() req: any): Promise<any> {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.fetchNextProfileAssessmentQuestion(
      user_id,
    );
  }

  /**
   * Fetches the profile assessment response based on the provided hash ID.
   * /v1/assessment-kits/assessment-response/profile-assessment/:hash_id
   * @param req - The request object.
   * @param hash_id - The hash ID of the profile assessment response to fetch.
   * @returns The profile assessment response.
   */
  @Get('/profile-assessment/:hash_id')
  @UseGuards(PublicAuthGuard)
  fetchProfileAssessmentResponse(
    @Req() req: any,
    @Param('hash_id') hash_id: string,
  ): Promise<AssessmentCandidateResponse[]> {
    return this.assessmentResponseService.fetchProfileAssessmentResponse(
      hash_id,
    );
  }

  /**
   * Creates a candidate profile response rating.
   * /v1/assessment-kits/assessment-response/rate-profile-assessment/
   * @param {UpdateAssessmentCandidateResponseRatingDto} rating - The rating data transfer object containing the rating details.
   * @param {any} req - The request object containing user information.
   * @returns {Promise<any>} - A promise that resolves to the created candidate profile response rating.
   */
  @Post('/rate-profile-assessment/')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  createCandidateProfileResponseRating(
    @Body() rating: UpdateAssessmentCandidateResponseRatingDto,
    @Req() req: any,
  ): Promise<AssessmentCandidateResponseRating> {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.createCandidateProfileResponseRating(
      +user_id,
      rating,
    );
  }

  /**
   * Updates the rating of a candidate's profile response.
   *
   * @param rating_id - The ID of the rating to be updated.
   * @param req - The request object containing user information.
   * @param rating - The DTO containing the updated rating information.
   * @returns The updated candidate profile response rating.
   */
  @Put('/rate-profile-assessment/:rating_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  updateCandidateProfileResponseRating(
    @Param('rating_id') rating_id: string,
    @Req() req: any,
    @Body() rating: UpdateAssessmentCandidateResponseRatingDto,
  ): Promise<AssessmentCandidateResponseRating> {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.updateCandidateProfileResponseRating(
      +rating_id,
      +user_id,
      rating,
    );
  }

  /**
   * Skips a profile question for a candidate.
   * /v1/assessment-kits/assessment-response/profile/skip-question/:question_id
   * @param question_id - The ID of the question to skip.
   * @param req - The request object containing user information.
   * @returns The updated candidate profile response.
   */
  @Put('/profile/skip-question/:question_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  skipProfileQuestion(
    @Param('question_id') question_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentResponseService.skipProfileQuestion(
      +question_id,
      user_id,
    );
  }
}
