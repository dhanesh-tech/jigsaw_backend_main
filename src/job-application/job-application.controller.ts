import {
  Controller,
  HttpException,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { JobApplicationDto } from './dto/job-application.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { Patch } from '@nestjs/common';
import { JOB_APPLICATION_STATUS } from './utilities/enum';
import {
  SKILL_ID_ARRAY_REQUIRED,
  STATUS_NOT_VALID,
} from 'src/_jigsaw/constants';
import { enumContainsValue } from 'src/_jigsaw/helpersFunc';
import { Get } from '@nestjs/common';

@Controller('v1/job-application')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  // to do ->  replace all ids with respective uuids

  /**
   * Handles the HTTP POST request to apply for a job.
   *
   * v1/job-application/apply
   * @param JobApplicationDto - The data transfer object containing the job application details.
   * @returns A promise that resolves to the result of the job application process.
   */
  @Post('/apply')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  async applyForJob(
    @Request() req: any,
    @Body() JobApplicationDto: JobApplicationDto,
  ) {
    const user_id = req?.user?.id;
    return await this.jobApplicationService.applyToJob(
      user_id,
      JobApplicationDto,
    );
  }

  /**
   * Handles the HTTP GET request to retrieve all job applications by their status.
   *
   * v1/job-application/applicants/:id
   * @param id - The ID of the job requirement.
   * @query status - The new status of the job application.
   * @returns A promise that resolves to the list of job applications with the specified status.
   */
  @Get('/applicants/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async getAllJobApplicationsByStatus(
    @Request() req: any,
    @Query('status') status: string,
  ) {
    const jobId = req.params.id;
    const user_id = req?.user?.id;
    if (status) {
      status = status.toLowerCase();
      if (!enumContainsValue(status, JOB_APPLICATION_STATUS)) {
        throw new HttpException(STATUS_NOT_VALID, HttpStatus.BAD_REQUEST);
      }
    }

    return await this.jobApplicationService.getAllJobApplicationsByStatus(
      user_id,
      jobId,
      status,
    );
  }

  /**
   * Handles the HTTP GET request to retrieve all candidates on the assessment stage.
   *
   * v1/job-application/assessment/:jobId
   * @param jobId - The ID of the job requirement.
   * @returns A promise that resolves to the list of candidates on the assessment stage.
   */
  @Get('/assessment/:jobId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async getCandidatesOnAssessmentStage(@Request() req: any) {
    const jobId = req.params.jobId;
    const user_id = req?.user?.id;
    return await this.jobApplicationService.getCandidatesOnAssessmentStage(
      user_id,
      jobId,
    );
  }

  /**
   * Handles the HTTP PATCH request to update the status of a job application.
   *
   * v1/job-application/status/:id
   * @param id - The ID of the job application to update.
   * @param status - The new status of the job application.
   * @returns A promise that resolves to the result of the update operation.
   */
  @Patch('/status/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async updateApplicationStatus(
    @Request() req: any,
    @Body('status') status: string,
  ) {
    const jobApplicationId = req.params.id;
    const user_id = req?.user?.id;
    status = status.toLowerCase();
    if (enumContainsValue(status, JOB_APPLICATION_STATUS)) {
      return await this.jobApplicationService.updateApplicationStatus(
        user_id,
        jobApplicationId,
        status,
      );
    }

    throw new HttpException(STATUS_NOT_VALID, HttpStatus.BAD_REQUEST);
  }

  /**
   * Handles the HTTP PATCH request to reject a job application by the candidate.
   *
   * v1/job-application/reject/:id
   * @param id - The ID of the job application to reject.
   * @returns A promise that resolves to the result of the rejection operation.
   */
  @Patch('/reject/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  async rejectApplicationByCandidate(@Request() req: any) {
    const jobApplicationId = req.params.id;
    const user_id = req?.user?.id;
    return await this.jobApplicationService.rejectApplicationByCandidate(
      user_id,
      jobApplicationId,
    );
  }

  /**
   * Handles the HTTP Post request to accept a job application by the Hiring manager.
   *
   * v1/job-application/accept-candidate
   * @param id - The ID of the job application to accept.
   * @returns A promise that resolves to the result of the acceptance operation.
   */
  @Post('/accept-candidate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async acceptCandidateOnJob(
    @Request() req: any,
    @Body() jobApplicationDto: JobApplicationDto,
  ) {
    const user_id = req?.user?.id;
    return await this.jobApplicationService.acceptCandidateOnJob(
      user_id,
      jobApplicationDto,
    );
  }

  /**
   * Handles the HTTP GET request to retrieve all job applications by the candidate.
   *
   * v1/job-application/applications/all
   * @returns A promise that resolves to the list of job applications.
   */
  @Get('/applications/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  async getAllJobApplicationsByCandidate(@Request() req: any) {
    const user_id = req?.user?.id;
    return await this.jobApplicationService.getAllJobApplicationsByCandidate(
      +user_id,
    );
  }

  /**
   * Retrieves a list of pre-vetted candidates for a specific job.
   *
   * v1/job-application/skills-prevetted-candidates/
   * @param skill_ids - The request object containing array of skill_ids .
   * @returns A promise that resolves to the list of pre-vetted candidates.
   */
  @Post('/skills-prevetted-candidates')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async getPreVettedCandidatesOnSkills(
    @Request() req: any,
    @Body() skills: { skill_ids: number[] },
  ) {
    if (!skills.skill_ids || skills.skill_ids.length === 0) {
      throw new HttpException(SKILL_ID_ARRAY_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    return await this.jobApplicationService.getPrevettedCandidatesOnSkills(
      skills.skill_ids,
    );
  }

  /**
   * Handles the HTTP POST request to add application_feedback to a job application.
   *
   * v1/job-application/feedback/:id
   * @param id - The ID of the job application to add application_feedback to.
   * @param application_feedback - The application_feedback content.
   * @returns A promise that resolves to the result of the feedback addition.
   */
  @Patch('/feedback/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async addApplicationFeedback(
    @Request() req: any,
    @Body('application_feedback') application_feedback: string,
  ) {
    const jobApplicationId = req.params.id;
    const user_id = req?.user?.id;
    return await this.jobApplicationService.addApplicationFeedback(
      user_id,
      jobApplicationId,
      application_feedback,
    );
  }

  /**
   * Handles the HTTP GET request to retrieve the details of a specific job application.
   *
   * v1/job-application/details/:id
   * @param id - The ID of the job application to retrieve details for.
   * @returns A promise that resolves to the details of the job application.
   */
  @Get('/details/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async jobApplicationDetails(@Request() req: any) {
    const jobApplicationId = req.params.id;
    const user_id = req?.user?.id;
    return await this.jobApplicationService.jobApplicationDetails(
      jobApplicationId,
      user_id,
    );
  }
}
