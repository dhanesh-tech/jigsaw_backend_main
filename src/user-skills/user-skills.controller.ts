import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserSkillsService } from './user-skills.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserSkillDto } from './dto/userSkill.dto';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { CandidateSkillRatingDto } from './dto/userSkillRating.dto';

@Controller('v1/user-skills')
export class UserSkillsController {
  constructor(private readonly userSkillsService: UserSkillsService) {}

  /**
   * v1/user-skills
   * create a new user skill
   * @body skillDto
   * @throws {HttpException} - If experience_level_enum is not valid
   */
  @Post('')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  createUserSkill(@Req() req: any, @Body() skillDto: UpdateUserSkillDto) {
    const user_id = req?.user?.id;
    return this.userSkillsService.createUserSkill(+user_id, skillDto);
  }

  /**
   * v1/user-skills/:user_skill_id
   * update user skill
   * @body skillDto
   * @throws {HttpException} - If experience_level_enum is not valid
   */
  @Put('/:user_skill_id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  updateUserSkill(
    @Req() req: any,
    @Body() skillDto: UpdateUserSkillDto,
    @Param('user_skill_id') user_skill_id: string,
  ) {
    const user_id = req?.user?.id;
    return this.userSkillsService.updateUserSkill(
      +user_skill_id,
      +user_id,
      skillDto,
    );
  }

  /**
   * v1/user-skills/:user_skill_id
   * delete user skill
   * @throws {HttpException} - if user is not logged in
   */
  @Delete('/:user_skill_id')
  @UseGuards(JwtAuthGuard)
  deleteUserSkill(
    @Req() req: any,
    @Param('user_skill_id') user_skill_id: string,
  ) {
    const user_id = req?.user?.id;
    return this.userSkillsService.deleteUserSkill(+user_skill_id, +user_id);
  }

  /**
   * v1/user-skills
   * get loggedin user skills
   * @throws {HttpException} - if user is not logged in
   */
  @Get('')
  @UseGuards(JwtAuthGuard)
  getAllSkills(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.userSkillsService.getUserSkills(+user_id);
  }

  /**
   * v1/user-skills/all/:user_hash_id
   * get user skills
   * @throws {HttpException} - if user is not logged in
   */
  @Get('/all/:user_hash_id')
  @UseGuards(PublicAuthGuard)
  getAllUserSkills(@Param('user_hash_id') user_hash_id: string) {
    return this.userSkillsService.getAllUserSkills(user_hash_id);
  }

  /**
   * Rates a candidate's skill by HM or Mentor.
   * @route POST /v1/user-skills/rate-candidate-skill
   * @param ratingDto - The rating details.
   * @returns A promise that resolves with the result of the rating operation.
   */
  @Post('/rate-candidate-skill')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  @UsePipes(new ValidationPipe())
  rateCandidateSkill(
    @Req() req: any,
    @Body() ratingDto: CandidateSkillRatingDto,
  ) {
    const user_id = req?.user?.id;
    return this.userSkillsService.rateCandidateSkill(ratingDto, +user_id);
  }

  /**
   * Retrieves all skill ratings given by the logged-in HM or Mentor.
   * @route GET /v1/user-skills/rated-candidate-skills/:candidate_id
   * @returns A promise that resolves with the list of skill ratings.
   */
  @Get('rated-candidate-skills/:candidate_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.hiring_manager)
  @UsePipes(new ValidationPipe())
  getCandidateSkillRatingsByUser(
    @Req() req: any,
    @Param('candidate_id') candidate_id: string,
  ) {
    const user_id = req?.user?.id;
    return this.userSkillsService.getCandidateSkillRatingsByUser(
      +candidate_id,
      +user_id,
    );
  }
}
