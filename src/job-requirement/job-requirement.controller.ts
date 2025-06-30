import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { JobRequirementService } from './job-requirement.service';
import { UpdateJobRequirementDto } from './dto/job-requirement.dto';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { USER_ROLE } from 'src/users/utilities/enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import {
  CreateJobRequirementSkillDto,
  UpdateJobRequirementSkillDto,
} from './dto/job-requirement-skill.dto';
import { STATUS_NOT_VALID } from 'src/_jigsaw/constants';
import { JobPostStatus } from './utilities/enum';
import { enumContainsValue } from 'src/_jigsaw/helpersFunc';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import { ValidEmailDto } from 'src/email/dto/send-email.dto';

@Controller('v1/jobs')
export class JobRequirementController {
  constructor(private readonly jobRequirementService: JobRequirementService) {}

  /**
   * Creates a new Job Requirement.
   * /v1/jobs
   * @param jobDto The data required to create a Job Requirement.
   * @param req The request object, which contains the authenticated user.
   * @returns The newly created Job Requirement.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async create(@Body() jobDto: UpdateJobRequirementDto, @Req() req: any) {
    const user_id = req?.user?.id;
    return await this.jobRequirementService.create(jobDto, +user_id);
  }

  /**
   * Retrieves all Job Requirements created by HM.
   * /v1/jobs
   * @param status The status to filter job requirements by.
   * @returns A list of user's Job Requirements
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async findMyRequirements(@Req() req: any, @Query('status') status?: string) {
    const user_id = req?.user?.id;
    if (status) {
      status = status.toLowerCase();
      // check status belongs to enum and then, throw error
      if (!enumContainsValue(status, JobPostStatus)) {
        throw new HttpException(STATUS_NOT_VALID, 400);
      }
    }
    return await this.jobRequirementService.findMyRequirements(user_id, status);
  }

  /**
   * /v1/jobs/all
   * Retrieves the published job requirements for all users
   * @returns A list of the published Job Requirements
   */
  @Get('/all')
  async findAllPublishedJobs() {
    return await this.jobRequirementService.findAllPublishedJobs();
  }

  /**
   * Retrieves a specific Job Requirement by ID.
   * /v1/jobs/:id
   * @param id The ID of the Job Requirement to retrieve.
   * @returns The Job Requirement with the specified ID.
   */
  @Get(':id')
  @UseGuards(PublicAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user_id = req?.user?.id;
    const user_role = req?.user?.role;
    return await this.jobRequirementService.findOne(+id, +user_id, user_role);
  }

  /**
   * Updates a Job Requirement.
   * /v1/jobs/:id
   * @param id The ID of the Job Requirement to update.
   * @param updateJobRequirementDto The updated data for the Job Requirement.
   * @returns The updated Job Requirement.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async update(
    @Param('id') id: string,
    @Body() updateJobRequirementDto: UpdateJobRequirementDto,
    @Req() req: any,
  ) {
    return await this.jobRequirementService.update(
      +id,
      updateJobRequirementDto,
      +req.user?.id,
    );
  }

  /**
   * Deletes a Job Requirement.
   * /v1/jobs/:id
   * @param id The ID of the Job Requirement to delete.
   * @returns A confirmation message upon successful deletion.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.jobRequirementService.remove(+id, +req.user?.id);
  }

  /**
   * Creates a new Job Requirement Skill.
   * /v1/jobs/skill
   * @param createJobRequirementSkillDto - DTO containing job requirement skill data.
   * @returns The created JobRequirementSkill entity.
   */
  @Post('/skill')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  createSKill(
    @Body() createJobRequirementSkillDto: CreateJobRequirementSkillDto,
    @Req() req: any,
  ) {
    return this.jobRequirementService.createSkill(
      createJobRequirementSkillDto,
      +req.user?.id,
    );
  }

  /**
   * Retrieves a Job Requirement Skill by ID.
   * /v1/jobs/skill/:id
   * @param id - The ID of the Job Requirement Skill.
   * @returns The JobRequirementSkill entity.
   */
  @Get('/skill/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  findSkill(@Param('id') id: string) {
    return this.jobRequirementService.findSkillById(+id);
  }

  /**
   * Updates an existing Job Requirement Skill.
   * /v1/jobs/skill/:id
   * @param id - The ID of the Job Requirement Skill to update.
   * @param updateJobRequirementSkillDto - DTO containing updated job requirement skill data.
   * @returns The updated JobRequirementSkill entity.
   */
  @Patch('/skill/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  updateSkill(
    @Param('id') id: string,
    @Body() updateJobRequirementSkillDto: UpdateJobRequirementSkillDto,
    @Req() req,
  ) {
    const userId = req.user?.id;
    return this.jobRequirementService.updateSkill(
      +id,
      updateJobRequirementSkillDto,
      userId,
    );
  }

  /**
   * Deletes a Job Requirement Skill.
   * /v1/jobs/skill/:id
   * @param id - The ID of the Job Requirement Skill to delete.
   */
  @Delete('skill/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  removeSkill(@Param('id') id: string, @Req() req) {
    return this.jobRequirementService.removeSkillById(+id, +req.user?.id);
  }

  /**
   * Handles the HTTP POST request to send email invites to multiple recipients.
   *
   * v1/jobs/send-email-invites/:id
   * @param emailInviteDto - The data transfer object containing the email invite details.
   * @returns A promise that resolves to the result of the email invite process.
   */
  @Post('/send-email-invites/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager)
  async sendEmailInvites(
    @Req() req: any,
    @Body() emailInviteDto: ValidEmailDto[],
  ) {
    const user_id = req?.user?.id;
    const jobId = req.params.id;
    return await this.jobRequirementService.sendEmailInvites(
      jobId,
      emailInviteDto,
      user_id,
    );
  }
}
