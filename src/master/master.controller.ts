import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MasterService } from './master.service';
import { AutomatedQuestionBankDto } from './dto/automatedQuestionBank.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { USER_ROLE } from 'src/users/utilities/enum';
import { TopicDto } from './dto/topic.dto';
import { QUESTION_STATUS } from './utilities/enum';
import { STATUS_NOT_VALID } from 'src/_jigsaw/constants';
import { CompanyIndustryDto } from './dto/companyIndustry.dto';
import { JobPrimaryRoleDto } from './dto/jobPrimaryRole.dto';
import { SkillDto } from './dto/skill.dto';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
@Controller('v1/base')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  // /v1/base/admin/automated-question-bank -> route to create questions by mentor,admin
  // takes the payload as an array of questions dto defined in dto file
  // returns the created questions
  @Post('/admin/automated-question-bank')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin)
  createQuestions(
    @Body() automatedQuestionBankDto: AutomatedQuestionBankDto[],
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.masterService.createMultipleQuestions(
      automatedQuestionBankDto,
      +user_id,
    );
  }

  // /v1/base/question -> route to create question by mentor, admin
  // takes the payload as an array of questions dto defined in dto file
  // returns the created question
  @Post('/question')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin, USER_ROLE.mentor)
  createQuestion(
    @Body() automatedQuestionBankDto: AutomatedQuestionBankDto,
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.masterService.createQuestion(automatedQuestionBankDto, user_id);
  }

  // /v1/base/question/:question_id -> route to update questions by mentor, admin
  // takes the payload as an array of questions dto defined in dto file
  // returns the updated question
  @Put('/question/:question_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin, USER_ROLE.mentor)
  updateQuestion(
    @Param('question_id') question_id: string,
    @Body() automatedQuestionBankDto: AutomatedQuestionBankDto,
    @Request() req: any,
  ) {
    const user_id = req?.user?.id;
    return this.masterService.updateQuestion(
      +question_id,
      automatedQuestionBankDto,
      user_id,
    );
  }

  // /v1/base/question-lists?status="" -> route to update questions by mentor, admin
  // takes the payload as an array of questions dto defined in dto file
  // returns the created questions
  @Get('/question-lists')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin, USER_ROLE.mentor)
  fetchQuestions(@Request() req: any, @Query('status') status: string) {
    const user_id = req?.user?.id;
    if (status) {
      status = status.toLowerCase();
      // check status belongs to enum and then, throw error
      if (!(status in QUESTION_STATUS)) {
        throw new HttpException(STATUS_NOT_VALID, 400);
      }
    }
    return this.masterService.fetchQuestionLists(user_id, status);
  }

  // /v1/base/admin/skills -> route to create skills by admin
  // takes the payload as an array of skills dto defined in dto file
  // returns the created skills
  @Post('/admin/skills')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin)
  createSkills(@Body() skillDtos: SkillDto[]) {
    return this.masterService.createMultipleSkills(skillDtos);
  }

  // /v1/base/admin/topic -> route to create topics by admin
  // takes the payload as an array of topic dto defined in dto file
  // returns the created topics based on skills
  @Post('/admin/topic')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin)
  createTopics(@Body() topicDtos: TopicDto[]) {
    return this.masterService.createMultipleTopics(topicDtos);
  }

  // /v1/base/skills-> route to get skills
  // returns the array of skills
  @Get('/skills')
  @UseGuards(JwtAuthGuard, RoleGuard)
  getSkills() {
    return this.masterService.getSkills();
  }

  // /v1/base/skill-topics/:skill_id -> route to get topics by skill id
  // takes the param skill_id
  // returns the topics based on skill_id
  @Get('/skill-topics/:skill_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  getSkillTopics(@Param('skill_id') id: string) {
    return this.masterService.getSkillTopics(+id);
  }

  /**
   * /v1/base/admin/company-industries
   * @param companyIndustryDtos -> an array of CompanyIndustryDto
   * @returns a list of the created CompanyIndustry as an array
   */
  @Post('/admin/company-industries')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin)
  createCompanyIndustries(@Body() companyIndustryDtos: CompanyIndustryDto[]) {
    return this.masterService.createMultipleCompanyIndustries(
      companyIndustryDtos,
    );
  }
  /**
   * /v1/base/company-industries
   * @returns a list of the saved CompanyIndustry as an array
   */
  @Get('/company-industries')
  getCompanyIndustries() {
    return this.masterService.getCompanyIndustries();
  }

  /**
   * /v1/base/admin/job-primary-roles
   * @param jobPrimaryRoleDtos -> an array of JobPrimaryRoleDtos
   * @returns a list of the created JobPrimaryRole as an array
   */
  @Post('/admin/job-primary-roles')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin)
  createJobPrimaryRoles(@Body() jobPrimaryRoleDtos: JobPrimaryRoleDto[]) {
    return this.masterService.createMultipleJobPrimaryRoles(jobPrimaryRoleDtos);
  }
  /**
   * /v1/base/job-primary-roles
   * @returns a list of the saved JobPrimaryRole as an array
   */
  @Get('/job-primary-roles')
  getJobPrimaryRoles() {
    return this.masterService.getJobPrimaryRoles();
  }

  /**
   *
   * @returns a list of the saved Companies as an array
   */
  @Get('/companies')
  @UseGuards(PublicAuthGuard)
  getAllComapanies() {
    return this.masterService.getAllComapanies();
  }

  /**
   *
   * @returns a list of the saved Companies as an array
   */
  @Get('/countries')
  @UseGuards(PublicAuthGuard)
  getAllCountries() {
    return this.masterService.getAllCountries();
  }

  /**
   *
   * @returns a list of the saved Companies as an array
   */
  @Get('/states/:country_id')
  @UseGuards(PublicAuthGuard)
  getAllStates(@Param('country_id') country_id: number) {
    return this.masterService.getAllStates(+country_id);
  }

  /**
   *
   * @returns a list of the saved Companies as an array
   */
  @Get('/cities/:state_id')
  @UseGuards(PublicAuthGuard)
  getAllCities(@Param('state_id') state_id: number) {
    return this.masterService.getAllCities(state_id);
  }
}
