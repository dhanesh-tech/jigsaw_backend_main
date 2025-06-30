import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
  Query,
  HttpException,
} from '@nestjs/common';

import {
  CreateAssignedAssessmentDto,
  UpdateAssignedAssessmentDto,
} from './dto/assignAssessment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { ASSESSMENT_ASSIGN_STATUS } from './utilities/enum';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import { AssignAssessmentService } from './assign-assessment.service';
import { STATUS_NOT_VALID } from 'src/_jigsaw/constants';
import { AssignedAssessmentKit } from './entities/assignAssessment.entity';

@Controller('v1/assessment-kits/assign-assessment')
export class AssignAssessmentController {
  constructor(
    private readonly assignAssessmentService: AssignAssessmentService,
  ) {}
  // /v1/assessment-kits/assign-assessment -> assign an assessment kit to candidate
  @Post('/')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager, USER_ROLE.recruiter)
  createAssignedAssessment(
    @Body() createAssignedAssessmentDto: CreateAssignedAssessmentDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.createAssignedAssessmentKit(
      createAssignedAssessmentDto,
      +user_id,
    );
  }

  /**
   * /v1/assessment-kits/assign-assessment/:assigned_id
   * can be accessed by anyone
   * @param assigned_id
   * @returns AssignedAssessmentKit
   */
  @Get('/:assigned_id')
  @UseGuards(PublicAuthGuard)
  findCandidateAssignedAssessmentDetails(
    @Param('assigned_id') assigned_id: string,
  ) {
    return this.assignAssessmentService.findCandidateAssignedAssessmentKitDetails(
      +assigned_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/candidates/:assessment_id -> get all candidate's assigned
  // status belongs assessment assign status enum
  @Get('/candidates/:assessment_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager, USER_ROLE.recruiter)
  findAssessmentAssignedCandidates(
    @Param('assessment_id') assessment_id: string,
    @Query('status') status: string,
  ) {
    if (status) {
      status = status.toLowerCase();
      // check status belongs to enum and then, throw error
      if (!(status in ASSESSMENT_ASSIGN_STATUS)) {
        throw new HttpException(STATUS_NOT_VALID, 400);
      }
    }

    return this.assignAssessmentService.findAssessmentKitAssignedCandidates(
      +assessment_id,
      status,
    );
  }

  // /v1/assessment-kits/assign-assessment/accept-review/:assessment_id -> accept assessment review by mentor
  @Patch('/accept-review/:assigned_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  acceptAssessmentToReview(
    @Param('assigned_id') assigned_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.acceptAssessmentKitToReview(
      +assigned_id,
      user_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/shortlist-candidate/:assigned_id -> mark the assigned assessment as shortlisted
  @Patch('/shortlist-candidate/:assigned_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  shortlistCandidateAssessment(
    @Param('assigned_id') assigned_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.shortlistCandidateAssessmentKit(
      +assigned_id,
      user_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/reject-candidate/:assigned_id -> mark the assigned assessment as rejected
  @Patch('/reject-candidate/:assigned_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  rejectCandidateAssessment(
    @Param('assigned_id') assigned_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.rejectCandidateAssessmentKit(
      +assigned_id,
      user_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/reviewee-remark/:assessment_id -> leave a remark by reviewer
  @Patch('/reviewee-remark/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  assessmentRemarkByReviewee(
    @Param('id') id: string,
    @Req() req: any,
    @Body() remark: UpdateAssignedAssessmentDto,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.assessmentKitRemarkByReviewee(
      +id,
      user_id,
      remark,
    );
  }

  // /v1/assessment-kits/assign-assessment/lists/assigned -> get all assigned assessment kits to candidate
  @Get('/lists/assigned')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  findAllAssignedAssessment(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.findAllAssignedAssessmentKit(+user_id);
  }

  // /v1/assessment-kits/assign-assessment/accept-assessment/:assessment_id -> accept assessment kit by candidate
  @Post('/accept-assessment/:assessment_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  acceptAssessmentByCandidate(
    @Param('assessment_id') assessment_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.acceptAssessmentKitByCandidate(
      +assessment_id,
      +user_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/assign-assessment/details/:assigned_id -> get assigned assessment details to candidate
  @Get('/details/:assigned_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  findAssignedAssessmentDetails(
    @Param('assigned_id') assigned_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.findAssignedAssessmentKitDetails(
      +assigned_id,
      +user_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/submit-assessment/:assigned_id -> mark the assessment kit as completed
  @Post('/submit-assessment/:assigned_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  submitAssessmentCandidate(
    @Param('assigned_id') assigned_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.submitAssessmentKitCandidate(
      +assigned_id,
      user_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/decline-assessment/:assigned_id -> mark the assessment kit as declined
  @Post('/decline-assessment/:assigned_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  declineAssessmentCandidate(
    @Param('assigned_id') assigned_id: string,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.declineAssessmentKitCandidate(
      +assigned_id,
      user_id,
    );
  }

  // /v1/assessment-kits/assign-assessment/lists/assigned/:hash_id -> get all assigned assessments and their responses of on candidate
  @Get('/lists/assigned/:hash_id')
  @UseGuards(PublicAuthGuard)
  getPublicProfileAssessments(@Param('hash_id') hash_id: string) {
    return this.assignAssessmentService.getPublicProfileAssessmentKits(hash_id);
  }

  /**
   * /v1/assessment-kits/assign-assessment/reviewed-assessment/all
   * get all reviewed assessment kits by mentor
   * @throws {HttpException} - if user is not logged in
   */
  @Get('/reviewed-assessment/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor)
  findAllReviewedAssessmentKits(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.findAllReviewedAssessmentKits(+user_id);
  }

  /**
   * /v1/assessment-kits/assign-assessment/review-assessment/all
   * get candidate completed assessment based on mentor skills
   * @throws {HttpException} - if user is not logged in
   */
  @Get('/review-assessment/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor)
  findAssessmentKitsToReview(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.findAssessmentKitsToReview(+user_id);
  }

  /**
   * Retrieves the profile assessment for the authenticated user.
   * /v1/assessment-kits/assign-assessment/candidate/profile-assessment
   *
   * @param req - The request object containing user information.
   * @returns The profile assessment for the user.
   */
  @Get('/candidate/profile-assessment')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  getProfileAssessment(@Req() req: any): Promise<AssignedAssessmentKit> {
    const user_id = req?.user?.id;
    return this.assignAssessmentService.getProfileAssessment(+user_id);
  }
}
