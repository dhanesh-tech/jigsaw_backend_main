import { Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { FlagQuestionBankDto } from './dto/flag-question-bank.dto';

@Controller('/v1/question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  /**
   * Flags a question in the automated question bank.
   * /v1/question-bank/flag
   * @param req - The request object containing user information.
   * @param flagQuestionDto - The DTO containing the question details to flag.
   * @returns The created flag record.
   */
  @Post('/flag')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.candidate, USER_ROLE.mentor)
  flagQuestion(@Req() req: any, @Body() flagQuestionDto: FlagQuestionBankDto) {
    const user_id = req?.user?.id;
    return this.questionBankService.flagQuestion(flagQuestionDto, +user_id);
  }

  /**
   * Retrieves all flagged questions for a specific user.
   * /v1/question-bank/flagged-questions/:user_id
   * @param user_id - The ID of the user whose flagged questions are to be retrieved.
   * @returns A promise that resolves to an array of flagged questions.
   */
  @Get('/flagged-questions/:user_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor)
  getFlaggedQuestionsByUser(@Param('user_id') user_id: string) {
    return this.questionBankService.getFlaggedQuestionsByUser(+user_id);
  }

  /**
   * Reviews a flagged question by updating its status and recording the user who reviewed it.
   * /v1/question-bank/review-flagged-question/:flagged_question_id
   * @param req - The request object containing user information.
   * @param flagged_question_id - The ID of the flagged question to be reviewed.
   * @param flagQuestionDto - The data transfer object containing the new status for the flagged question.
   * @returns A promise that resolves to the updated flagged question instance.
   */
  @Put('/review-flagged-question/:flagged_question_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor)
  reviewFlaggedQuestion(
    @Req() req: any,
    @Param('flagged_question_id') flagged_question_id: string,
    @Body() flagQuestionDto: FlagQuestionBankDto,
  ) {
    const user_id = req?.user?.id;
    return this.questionBankService.reviewFlaggedQuestion(
      +flagged_question_id,
      flagQuestionDto,
      +user_id,
    );
  }
}
