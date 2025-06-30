import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AutomatedQuestionBankFlag } from './entities/flag-question-bank.entity';
import { FlagQuestionBankDto } from './dto/flag-question-bank.dto';
import { DataSource, LessThan, Repository } from 'typeorm';
import {
  FLAGGED_QUESTION_THRESHOLD_IN_LAST_24_HOURS,
  QUESTION_ALREADY_FLAGGED_MORE_THAN_THRESHOLD,
  QUESTION_NOT_EXIST,
  WRONG_CRON_JOB_CALLED,
} from 'src/_jigsaw/constants';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { QuestionFlagStatus } from './utilities/enums';
import { CronJobConstants } from 'src/_jigsaw/enums';
import {
  getArchiveFlaggedQuestionsQuery,
  removeFlaggedQuestionsFromCandidateResponseQuery,
  updateQuestionStatusQuery,
} from './utilities/helpers';
import { QUESTION_STATUS } from 'src/master/utilities/enum';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(AutomatedQuestionBankFlag)
    private readonly questionBankFlagRepository: Repository<AutomatedQuestionBankFlag>,

    @InjectDataSource()
    private readonly dataSourceRepository: Repository<DataSource>,
  ) {}

  /**
   * Flags a question in the automated question bank.
   *
   * @param flagQuestionDto - The DTO containing the question details to flag
   * @param user_id - The ID of the user flagging the question
   * @returns The created flag record
   * @throws HttpException if the user has already flagged this question
   */
  async flagQuestion(
    flagQuestionDto: FlagQuestionBankDto,
    user_id: number,
  ): Promise<AutomatedQuestionBankFlag> {
    const { question_id } = flagQuestionDto;

    const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

    // Check if the question has already been flagged by the user in the last 24 hours
    const existingFlag = await this.questionBankFlagRepository.find({
      where: {
        flagged_by_id: { id: +user_id },
        created_at: LessThan(oneDayAgo),
      },
    });

    // If the question has been flagged more than the threshold, throw an error
    if (existingFlag.length >= FLAGGED_QUESTION_THRESHOLD_IN_LAST_24_HOURS) {
      throw new HttpException(
        QUESTION_ALREADY_FLAGGED_MORE_THAN_THRESHOLD,
        HttpStatus.BAD_REQUEST,
      );
    }
    const newFlagQuestion = await this.questionBankFlagRepository.create({
      ...flagQuestionDto,
      question_id: { id: +question_id },
      flagged_by_id: { id: +user_id },
    });

    const savedFlagQuestion =
      await this.questionBankFlagRepository.save(newFlagQuestion);

    return classSerialiser(AutomatedQuestionBankFlag, savedFlagQuestion);
  }

  /**
   * Retrieves all flagged questions for a specific user.
   *
   * @param user_id - The ID of the user whose flagged questions are to be retrieved.
   * @returns A promise that resolves to an array of AutomatedQuestionBankFlag
   */
  async getFlaggedQuestionsByUser(
    user_id: number,
  ): Promise<AutomatedQuestionBankFlag[]> {
    const flaggedQuestions = await this.questionBankFlagRepository.find({
      where: {
        flagged_by_id: { id: +user_id },
        status: QuestionFlagStatus.flagged,
      },
      relations: ['question_id', 'question_id.skill_id'],
    });

    return flaggedQuestions.map((question) =>
      classSerialiser(AutomatedQuestionBankFlag, question),
    );
  }

  /**
   * Reviews a flagged question by updating its status and recording the user who reviewed it.
   *
   * @param flagged_question_id - The ID of the flagged question to be reviewed.
   * @param flagQuestionDto - The data transfer object containing the new status for the flagged question.
   * @param user_id - The ID of the user performing the review.
   * @returns A promise that resolves to the updated AutomatedQuestionBankFlag instance.
   * @throws HttpException if the flagged question does not exist.
   */
  async reviewFlaggedQuestion(
    flagged_question_id: number,
    flagQuestionDto: FlagQuestionBankDto,
    user_id: number,
  ): Promise<AutomatedQuestionBankFlag> {
    const { status } = flagQuestionDto;

    // Check if the flagged question exists
    const [flaggedQuestion] = await this.questionBankFlagRepository.find({
      where: { id: flagged_question_id },
      relations: ['question_id', 'question_id.skill_id'],
    });

    if (!flaggedQuestion) {
      throw new HttpException(QUESTION_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    // Update the status and the user who reviewed it
    await this.questionBankFlagRepository.update(flagged_question_id, {
      status,
      reviewed_by_id: { id: user_id },
    });

    return classSerialiser(AutomatedQuestionBankFlag, flaggedQuestion);
  }

  /**
   * Archives flagged questions based on the cron job name.
   *
   * @param cron_job_name - The name of the cron job to be executed.
   * @returns A promise that resolves to a boolean value indicating the success of the operation.
   * @throws Error if the cron job name is incorrect.
   *
   * This function does the following:
   * 1. Get the flagged questions from the automated question bank flag table that have been flagged more than the threshold
   * 2. Update the status of the flagged questions in the automated question bank table to archived
   * 3. Remove the flagged questions from the candidate response table
   */
  async archiveFlaggedQuestions(cron_job_name: string): Promise<boolean> {
    if (cron_job_name !== CronJobConstants.archiveFlaggedQuestions) {
      throw new Error(WRONG_CRON_JOB_CALLED(cron_job_name));
    }

    // Get the flagged questions from the automated question bank flag table that have been flagged more than the threshold
    const flaggedQuestions = await this.dataSourceRepository.query(
      getArchiveFlaggedQuestionsQuery(),
    );

    // Get the question ids of the flagged questions
    const questionIds = flaggedQuestions.map(
      (question: { question_id: number }) => question.question_id,
    );

    // Update the status of the flagged questions in the automated question bank table to archived
    await this.dataSourceRepository.query(
      updateQuestionStatusQuery(questionIds, QUESTION_STATUS.archived),
    );

    // remove the flagged questions from candidate response table
    await this.dataSourceRepository.query(
      removeFlaggedQuestionsFromCandidateResponseQuery(questionIds),
    );

    return true;
  }
}
