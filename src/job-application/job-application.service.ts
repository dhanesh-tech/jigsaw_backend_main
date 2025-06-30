import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { JobApplicationDto } from './dto/job-application.dto';
import { JobApplication } from './entities/job-application.entity';
import { JOB_APPLICATION_STATUS } from './utilities/enum';
import {
  ALREADY_CONSIDERED_ON_SIMILAR_JOBS_LIKE_THIS,
  JOB_APPLICATION_NOT_FOUND_OR_NO_PERMISSION,
  JOB_REQUIREMENT_ERRORS,
  WRONG_CRON_JOB_CALLED,
} from 'src/_jigsaw/constants';
import { JobRequirement } from 'src/job-requirement/entities/jobRequirement.entity';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { User } from 'src/users/entities/user.entity';
import { PrevettedCandidatesView } from './entities/prevetted-candidates-view.entity';
import { refreshPrevettedCandidatesMaterializedViewQuery } from './utilities/helpers';
import { CronJobConstants } from 'src/_jigsaw/enums';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectRepository(JobApplication)
    private jobApplicationRepository: Repository<JobApplication>,

    @InjectRepository(JobRequirement)
    private jobRequirementRepository: Repository<JobRequirement>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(PrevettedCandidatesView)
    private readonly prevettedCandidatesRepository: Repository<PrevettedCandidatesView>,

    @InjectDataSource() private readonly datasource: DataSource,
  ) {}

  /**
   * Applies for a job with the given user ID and job application details.
   *
   * @param user_id - The ID of the user applying for the job.
   * @param jobApplicationDto - The data transfer object containing job application details.
   * @returns A promise that resolves to the newly created job application.
   * @throws {HttpException} If the user has already applied for a similar job.
   */
  async applyToJob(
    user_id: number,
    jobApplicationDto: JobApplicationDto,
  ): Promise<JobApplication> {
    const { jobrequirement_id } = jobApplicationDto;

    // Check if the candidate has already applied for once
    const existingApplication = await this.jobApplicationRepository.findOne({
      where: {
        candidate_id: { id: user_id },
        jobrequirement_id: { id: jobrequirement_id },
      },
    });

    if (existingApplication) {
      throw new HttpException(
        ALREADY_CONSIDERED_ON_SIMILAR_JOBS_LIKE_THIS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const newJobApplication = this.jobApplicationRepository.create({
      candidate_id: { id: user_id },
      jobrequirement_id: { id: jobrequirement_id },
      application_status: JOB_APPLICATION_STATUS.assessed,
    });

    return await this.jobApplicationRepository.save(newJobApplication);
  }

  /**
   * Updates the status of a candidate's job application.
   *
   * @param user_id - The ID of the user who created the job requirement.
   * @param jobApplicationId - The ID of the job application to update.
   * @param status - The new status to set for the job application.
   * @returns A promise that resolves to the updated job application.
   */
  async updateApplicationStatus(
    user_id: number,
    jobApplicationId: number,
    status: string,
  ): Promise<JobApplication> {
    const jobApplication = await this.jobApplicationRepository.findOne({
      where: {
        id: jobApplicationId,
        jobrequirement_id: {
          posted_by_id: { id: user_id },
        },
      },
    });

    if (!jobApplication) {
      throw new HttpException(
        JOB_APPLICATION_NOT_FOUND_OR_NO_PERMISSION,
        HttpStatus.NOT_FOUND,
      );
    }

    jobApplication.application_status = JOB_APPLICATION_STATUS[status];
    return await this.jobApplicationRepository.save(jobApplication);
  }

  /**
   * Rejects a job application by candidate ID.
   *
   * @param user_id - The ID of the user who created the job requirement.
   * @param candidate_id - The ID of the candidate whose job application is to be rejected.
   * @returns A promise that resolves to the result of the rejection process.
   */
  async rejectApplicationByCandidate(
    user_id: number,
    jobApplicationId: number,
  ): Promise<JobApplication> {
    const jobApplication = await this.jobApplicationRepository.findOne({
      where: {
        candidate_id: { id: user_id },
        id: jobApplicationId,
      },
    });

    if (!jobApplication) {
      throw new HttpException(
        JOB_APPLICATION_NOT_FOUND_OR_NO_PERMISSION,
        HttpStatus.NOT_FOUND,
      );
    }

    jobApplication.application_status = JOB_APPLICATION_STATUS.rejected;
    return await this.jobApplicationRepository.save(jobApplication);
  }

  /**
   * Creates or updates a job application to the 'interview' stage.
   *
   * @param user_id - The ID of the user who created the job requirement.
   * @param candidate_id - The ID of the candidate applying for the job.
   * @param jobrequirement_id - The ID of the job requirement.
   * @returns A promise that resolves to the created or updated job application.
   */
  async acceptCandidateOnJob(
    user_id: number,
    jobApplicationDto: JobApplicationDto,
  ): Promise<JobApplication> {
    const { jobrequirement_id, candidate_id } = jobApplicationDto;

    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: { id: jobrequirement_id, posted_by_id: { id: user_id } },
    });

    if (!jobRequirement) {
      throw new HttpException(
        JOB_REQUIREMENT_ERRORS.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    // Check if the candidate has already one job application
    const jobApplication = await this.jobApplicationRepository.findOne({
      where: {
        candidate_id: { id: candidate_id },
        jobrequirement_id: { id: jobrequirement_id },
      },
    });

    if (jobApplication) {
      // Update the existing job application to 'interview' stage
      jobApplication.application_status = JOB_APPLICATION_STATUS.interview;
      return await this.jobApplicationRepository.save(jobApplication);
    } else {
      // Create a new job application with 'interview' stage
      const newJobApplication = this.jobApplicationRepository.create({
        candidate_id: { id: candidate_id },
        jobrequirement_id: { id: jobrequirement_id },
        application_status: JOB_APPLICATION_STATUS.interview,
      });
      return await this.jobApplicationRepository.save(newJobApplication);
    }
  }

  /**
   * Fetches candidates who are in the 'assessment' stage for a given job requirement.
   *
   * @param user_id - The ID of the user who created the job requirement.
   * @param jobrequirement_id - The ID of the job requirement.
   * @returns A promise that resolves to an array of job applications in the 'assessment' stage.
   * @throws {HttpException} If the job requirement is not found or has no associated skills.
   */
  async getCandidatesOnAssessmentStage(
    user_id: number,
    jobrequirement_id: number,
  ): Promise<JobApplication[]> {
    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: { id: jobrequirement_id, posted_by_id: { id: user_id } },
      relations: ['skills'],
    });

    if (!jobRequirement || !jobRequirement.skills) {
      throw new HttpException(
        JOB_REQUIREMENT_ERRORS.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const candidates = await this.jobApplicationRepository.find({
      where: {
        jobrequirement_id: { id: jobrequirement_id },
        application_status: JOB_APPLICATION_STATUS.assessed,
      },
      relations: [
        'candidate_id',
        'candidate_id.skills',
        'candidate_id.skills.skill_id',
        'candidate_id.referral_invite',
        'candidate_id.referral_invite.referred_by_id',
        'candidate_id.assessments',
      ],
    });

    if (!candidates) {
      return [];
    }
    // commenting this out as all candidates can apply and not just referred ones
    // // Filter candidates whose referred_by_id.id === user_id
    // const filteredCandidates = candidates.filter(
    //   (candidate) =>
    //     candidate?.candidate_id?.referral_invite?.referred_by_id?.id ===
    //     user_id,
    // );

    return candidates.map((candidate) =>
      classSerialiser(JobApplication, candidate),
    );
  }

  /**
   * Fetches all candidates by status for a given job requirement.
   *
   * @param user_id - The ID of the user who created the job requirement.
   * @param jobrequirement_id - The ID of the job requirement.
   * @param status - The status of the job applications to filter by.
   * @returns A promise that resolves to an array of job applications.
   */
  async getAllJobApplicationsByStatus(
    user_id: number,
    jobrequirement_id: number,
    status: string,
  ): Promise<JobApplication[]> {
    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: { id: jobrequirement_id, posted_by_id: { id: user_id } },
    });

    if (!jobRequirement) {
      throw new HttpException(
        JOB_REQUIREMENT_ERRORS.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const query = status
      ? {
          jobrequirement_id: { id: jobrequirement_id },
          application_status: JOB_APPLICATION_STATUS[status],
        }
      : {
          jobrequirement_id: { id: jobrequirement_id },
        };

    const jobApplications = await this.jobApplicationRepository.find({
      where: query,
      relations: [
        'candidate_id',
        'candidate_id.skills',
        'candidate_id.skills.skill_id',
        'candidate_id.referral_invite',
        'candidate_id.referral_invite.referred_by_id',
        'scheduled_interviews',
        'candidate_id.assessments',
      ],
    });
    return jobApplications.map((jobApplication) => {
      return classSerialiser(JobApplication, jobApplication);
    });
  }

  /**
   * Fetches all job applications for a given user.
   *
   * @param user_id - The ID of the user to fetch job applications for.
   * @returns A promise that resolves to an array of job applications.
   */
  async getAllJobApplicationsByCandidate(
    user_id: number,
  ): Promise<JobApplication[]> {
    const jobApplications = await this.jobApplicationRepository.find({
      where: { candidate_id: { id: user_id } },
      relations: [
        'jobrequirement_id',
        'jobrequirement_id.skills',
        'jobrequirement_id.skills.skill_id',
        'jobrequirement_id.company_industry_id',
        'jobrequirement_id.primary_role_id',
        'jobrequirement_id.country_id',
        'jobrequirement_id.state_id',
        'jobrequirement_id.city_id',
        'jobrequirement_id.posted_by_id',
        'scheduled_interviews',
      ],
    });
    // Transform each jobRequirement to exclude sensitive fields
    const results = jobApplications.map((jobApplication) => {
      return classSerialiser(JobApplication, jobApplication);
    });

    return results;
  }

  /**
   * Retrieves a list of pre-vetted candidates based on the provided skill IDs.
   *
   * @param {number[]} skill_ids - An array of skill IDs to filter candidates by.
   * @returns {Promise<User[]>} A promise that resolves to an array of User objects that match the given skill IDs.
   *
   * @throws {Error} If there is an issue retrieving candidates from the repository.
   *
   * @example
   * const skillIds = [1, 2, 3];
   * const candidates = await getPrevettedCandidatesOnSkills(skillIds);
   */
  async getPrevettedCandidatesOnSkills(skill_ids: number[]): Promise<User[]> {
    //create a new set of skill ids to filter to avoid duplicates
    const skillIdsToFilter = new Set(skill_ids);

    const allPrevettedCandidates =
      await this.prevettedCandidatesRepository.find();
    const prevettedCandidatesIds = allPrevettedCandidates.map(
      (candidate) => candidate.candidate_id,
    );

    const prevettedCandidates = await this.userRepository.find({
      where: {
        id: In(prevettedCandidatesIds),
      },
      relations: ['assessments', 'skills', 'skills.skill_id'],
    });

    if (!prevettedCandidates.length) {
      return [];
    }

    /// Filter candidates based on the provided skill
    /// if skill evaluated_rating_value is greater than or equal to 1
    /// then only consider them as pre-vetted candidates
    const filteredCandidates = prevettedCandidates.filter((candidate) =>
      candidate.skills.some(
        (skill) =>
          skillIdsToFilter.has(skill.skill_id.id) &&
          skill.evaluated_rating_value >= 1,
      ),
    );
    return filteredCandidates.map((candidate) => {
      return classSerialiser(User, candidate);
    });
  }

  /**
   * Adds feedback to a job application.
   *
   * @param user_id - The ID of the user providing the feedback.
   * @param jobApplicationId - The ID of the job application to add feedback to.
   * @param application_feedback - The feedback to add to the job application.
   * @returns A promise that resolves to the updated job application with feedback.
   * @throws {HttpException} If the job application is not found or the user has no permission.
   */
  async addApplicationFeedback(
    user_id: number,
    jobApplicationId: number,
    application_feedback: string,
  ): Promise<JobApplication> {
    const jobApplication = await this.jobApplicationRepository.findOne({
      where: {
        id: jobApplicationId,
        jobrequirement_id: {
          posted_by_id: { id: user_id },
        },
      },
    });

    if (!jobApplication) {
      throw new HttpException(
        JOB_APPLICATION_NOT_FOUND_OR_NO_PERMISSION,
        HttpStatus.NOT_FOUND,
      );
    }

    jobApplication.application_feedback = application_feedback;
    return await this.jobApplicationRepository.save(jobApplication);
  }

  /**
   * Retrieves detailed information about a specific job application.
   *
   * @param user_id - The ID of the user requesting the details.
   * @param jobApplicationId - The ID of the job application to retrieve details for.
   * @returns A promise that resolves to the detailed job application.
   * @throws {HttpException} If the job application is not found or the user has no permission.
   */
  async jobApplicationDetails(
    jobApplicationId: number,
    user_id: number,
  ): Promise<JobApplication> {
    const jobApplication = await this.jobApplicationRepository.findOne({
      where: {
        id: jobApplicationId,
        jobrequirement_id: { posted_by_id: { id: user_id } },
      },
      relations: [
        'jobrequirement_id',
        'jobrequirement_id.company_industry_id',
        'jobrequirement_id.primary_role_id',
        'jobrequirement_id.country_id',
        'jobrequirement_id.state_id',
        'jobrequirement_id.city_id',
        'candidate_id',
        'candidate_id.skills',
        'candidate_id.skills.skill_id',
        'candidate_id.referral_invite',
        'candidate_id.referral_invite.referred_by_id',
        'candidate_id.assessments',
        'scheduled_interviews',
      ],
    });

    if (!jobApplication) {
      throw new HttpException(
        JOB_APPLICATION_NOT_FOUND_OR_NO_PERMISSION,
        HttpStatus.NOT_FOUND,
      );
    }

    return classSerialiser(JobApplication, jobApplication);
  }

  /**
   * Refreshes the materialized view for prevetted candidates.
   *
   * @param cron_job_name - The name of the cron job that is calling this method.
   * @returns A promise that resolves to `true` if the materialized view was successfully refreshed.
   * @throws Will throw an error if the wrong cron job name is provided.
   */
  async refreshPrevettedCandidatesMaterializedView(
    cron_job_name: string,
  ): Promise<boolean> {
    if (cron_job_name !== CronJobConstants.refreshPrevettedCandidates) {
      throw new Error(WRONG_CRON_JOB_CALLED(cron_job_name));
    }
    await this.datasource.query(
      refreshPrevettedCandidatesMaterializedViewQuery,
    );
    return true;
  }
}
