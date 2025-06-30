import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto, UpdateAssessmentDto } from './dto/assessment.dto';
import {
  CreateAssessmentSkillDto,
  SkillDifficultyLevelDto,
  UpdateAssessmentSkillDto,
} from './dto/assessmentSkill.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { ASSESSMENT_STATUS } from './utilities/enum';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import { AssessmentQuestionDto } from './dto/assessmentQuestion.dto';
import {
  NO_ASSESSMENT_FOUND_WITH_SKILL,
  STATUS_NOT_VALID,
} from 'src/_jigsaw/constants';

@Controller('v1/assessment-kits/assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  /**
   * /v1/assessment-kits/assessment
   * restricted only for admin for now
   * @param req
   * @param createAssessmentDto
   * @returns
   */
  @Post('/')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    // USER_ROLE.mentor,
    // USER_ROLE.hiring_manager,
    // USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  createAssessment(
    @Req() req: any,
    @Body() createAssessmentDto: CreateAssessmentDto,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentService.createAssessmentKit(
      createAssessmentDto,
      +user_id,
    );
  }

  // /v1/assessment-kits/assessment/:assessment_id -> get one assessment kit details
  @Get('/:assessment_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  findOneAssessment(@Param('assessment_id') assessment_id: string) {
    return this.assessmentService.findOneAssessmentKit(+assessment_id);
  }

  // /v1/assessment-kits/assessment/:assessment_id -> update assessment kit
  @Put('/:assessment_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  updateAssessment(
    @Param('assessment_id') assessment_id: string,
    @Body() updateAssessmentDto: UpdateAssessmentDto,
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentService.updateAssessmentKit(
      +assessment_id,
      updateAssessmentDto,
      +user_id,
    );
  }

  // /v1/assessment-kits/assessment/:assessment_id -> delete assessment kit
  @Delete('/:assessment_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  removeAssessment(
    @Param('assessment_id') assessment_id: string,
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentService.removeAssessmentKit(+assessment_id, user_id);
  }

  // /v1/assessment-kits/assessment/details/:hash_id -> get public assessment kit details
  @Get('/details/:hash_id')
  @UseGuards(PublicAuthGuard)
  findAssessmentDetails(
    @Param('hash_id') hash_id: string,
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentService.findAssessmentKitDetails(hash_id, +user_id);
  }

  // /v1/assessment-kits/assessment/lists/:status -> get filtered assessments based on status
  // status belongs assessment status enum
  @Get('/lists/:status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  findAllAssessment(@Request() req: any, @Param('status') status: string) {
    const user_id = req?.user?.id;
    status = status.toLowerCase();
    if (status in ASSESSMENT_STATUS) {
      return this.assessmentService.findAllAssessmentKit(user_id, status);
    }
    throw new HttpException(STATUS_NOT_VALID, 400);
  }

  // /v1/assessment-kits/assessment/skill -> create assessment skill on an assessment kit
  @Post('/skill')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  createAssessmentSkill(
    @Body() createAssessmentSkillDto: CreateAssessmentSkillDto,
  ) {
    return this.assessmentService.createAssessmentKitSkill(
      createAssessmentSkillDto,
    );
  }

  // /v1/assessment-kits/assessment/skill/:assessment_skill_id -> update one assessment skill on an assessment kit
  @Put('/skill/:assessment_skill_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  updateAssessmentSkill(
    @Param('assessment_skill_id') assessment_skill_id: string,
    @Body() updateAssessmentSkillDto: UpdateAssessmentSkillDto,
  ) {
    return this.assessmentService.updateAssessmentKitSkill(
      +assessment_skill_id,
      updateAssessmentSkillDto,
    );
  }

  // /v1/assessment-kits/assessment/skill/:assessment_skill_id -> delete one assessment skill on an assessment kit
  @Delete('/skill/:assessment_skill_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  removeAssessmentSkill(
    @Param('assessment_skill_id') assessment_skill_id: string,
  ) {
    return this.assessmentService.removeAssessmentKitSkill(
      +assessment_skill_id,
    );
  }

  // /v1/assessment-kits/assessment/question -> create assessment question on an assessment kit
  @Post('/question')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  createAssessmentQuestion(
    @Body() questionDto: AssessmentQuestionDto,
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentService.createAssessmentKitQuestion(
      questionDto,
      +user_id,
    );
  }

  // /v1/assessment-kits/assessment/question/:assessment_question_id -> update assessment question on an assessment kit
  @Put('/question/:assessment_question_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  updateAssessmentQuestion(
    @Param('assessment_question_id') assessment_question_id: string,
    @Body() questionDto: AssessmentQuestionDto,
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.assessmentService.updateAssessmentKitQuestion(
      +assessment_question_id,
      questionDto,
      +user_id,
    );
  }

  // /v1/assessment-kits/assessment/question/:assessment_question_id -> delete assessment question on an assessment kit
  @Delete('/question/:assessment_question_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  removeAssessmentQuestion(
    @Param('assessment_question_id') assessment_question_id: string,
  ) {
    return this.assessmentService.removeAssessmentKitQuestion(
      +assessment_question_id,
    );
  }

  // /v1/assessment-kits/assessment/questions/:assessment_id -> get all custom questions on an assessment kit
  @Get('/questions/:assessment_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(
    USER_ROLE.mentor,
    USER_ROLE.hiring_manager,
    USER_ROLE.recruiter,
    USER_ROLE.admin,
  )
  findAllAssessmentQuestions(@Param('assessment_id') assessment_id: string) {
    return this.assessmentService.findAllAssessmentKitQuestions(+assessment_id);
  }

  /**
   * Retrieves all skill assessments for a user based on the provided skill difficulty levels.
   *
   * @param req - The request object containing user information.
   * @param skills - An array of skill difficulty level DTOs.
   * @returns A promise that resolves to the user's skill assessment kits.
   * @throws {HttpException} If no skills are provided or the skills array is empty.
   */
  @Post('/skill-assessments/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate)
  getAllUserSkillAssessments(
    @Request() req: any,
    @Body() skills: SkillDifficultyLevelDto[],
  ) {
    const user_id = req?.user?.id;
    if (!skills || !skills.length) {
      throw new HttpException(
        NO_ASSESSMENT_FOUND_WITH_SKILL,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.assessmentService.getAllUserSkillAssessmentKits(
      user_id,
      skills,
    );
  }
}
