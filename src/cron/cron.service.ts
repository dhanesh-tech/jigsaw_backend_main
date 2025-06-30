import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { CronJobConstants } from 'src/_jigsaw/enums';
import { JIGSAW_AI_SERVER_URL } from 'src/_jigsaw/envDefaults';
import { JobApplicationService } from 'src/job-application/job-application.service';
import { QuestionBankService } from 'src/question-bank/question-bank.service';
import { UserSkillsService } from 'src/user-skills/user-skills.service';

@Injectable()
export class CronService {
  constructor(
    private readonly userSkillsService: UserSkillsService,
    private readonly jobApplicationService: JobApplicationService,
    private readonly questionBankService: QuestionBankService,
  ) {}

  /**
   * Refreshes the prevetted candidates by performing the following steps:
   * 1. Refreshes the materialized view for prevetted candidates.
   *
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  @Cron(CronExpression.EVERY_2_HOURS)
  async refreshPrevettedCandidates(): Promise<void> {
    // refresh materialized view
    const refreshedView =
      await this.jobApplicationService.refreshPrevettedCandidatesMaterializedView(
        CronJobConstants.refreshPrevettedCandidates,
      );

    // if view is refreshed
    if (refreshedView) {
      // todo replace with logger in next pr
      console.log('refreshedView ============', refreshedView);
    }
  }

  /**
   * Refreshes the candidate skill ratings by performing the following steps:
   * 1. Refreshes the materialized view for candidate skills.
   * 2. Updates the candidate's skill ratings if the materialized view was successfully refreshed.
   *
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async refreshCandidateSkillRatings(): Promise<void> {
    // refresh materialized view
    const refreshedView =
      await this.userSkillsService.refreshCandidateSkillsMaterializedView(
        CronJobConstants.refreshCandidateSkillRatings,
      );

    // update candidate's skill ratings
    if (refreshedView) {
      // todo replace with logger in next pr
      console.log('refreshedView ============', refreshedView);
      await this.userSkillsService.updateUserSkillRatings();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveFlaggedQuestionsCron(): Promise<void> {
    const archiveSuccess =
      await this.questionBankService.archiveFlaggedQuestions(
        CronJobConstants.archiveFlaggedQuestions,
      );

    if (archiveSuccess) {
      // todo replace with logger in next pr
      console.log('archiveSuccess ============', archiveSuccess);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async pingAiServer(): Promise<void> {
    try {
      await axios.get(`${JIGSAW_AI_SERVER_URL}/api/ping`);
      console.log('pinged ai server ============');
    } catch (error) {
      console.error('Error pinging AI server:', error);
    }
  }
}
