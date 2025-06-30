import { HttpException, Injectable } from '@nestjs/common';
import { UserSkills } from './entities/userSkill.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserSkillDto } from './dto/userSkill.dto';
import {
  USER_SKILL_DOES_NOT_EXIST,
  WRONG_CRON_JOB_CALLED,
} from 'src/_jigsaw/constants';
import { UserRatedSkillView } from './entities/user-rated-skill-view.entity';
import { CronJobConstants } from 'src/_jigsaw/enums';
import { refreshSkillRatingMaterializedViewQuery } from './utilities/helpers';
import { CandidateSkillRating } from './entities/candidate-skill-ratings.entity';
import { CandidateSkillRatingDto } from './dto/userSkillRating.dto';

@Injectable()
export class UserSkillsService {
  constructor(
    @InjectRepository(UserSkills)
    private userSkillRepository: Repository<UserSkills>,

    @InjectRepository(UserRatedSkillView)
    private readonly ratedSkillViewRepository: Repository<UserRatedSkillView>,

    @InjectDataSource() private readonly datasource: DataSource,

    @InjectRepository(CandidateSkillRating)
    private candidateSkillRatingRepository: Repository<CandidateSkillRating>,
  ) {}

  /**
   * create user skills
   * @param skillDto, user_id - User which is logged in
   * @throws {HttpException} - If user skill with same user and skill exist
   * @returns {UserSkills} - create new column with user_id and skill_id
   */
  async createUserSkill(
    user_id: number,
    skillDto: UpdateUserSkillDto,
  ): Promise<UserSkills> {
    const newUserSkill = this.userSkillRepository.create({
      ...skillDto,
      user_id: { id: user_id },
    });

    return await this.userSkillRepository.save(newUserSkill);
  }

  /**
   * update user skills
   * @param skillDto, user_id, skill_id
   * @throws {HttpException} - If user skill does not exist or user is unauthorised
   * @returns {UserSkills} - update column with user_id and skill_id
   */
  async updateUserSkill(
    user_skill_id: number,
    user_id: number,
    skillDto: UpdateUserSkillDto,
  ): Promise<UserSkills> {
    const [userSkill] = await this.userSkillRepository.find({
      where: { id: user_skill_id, user_id: { id: user_id } },
    });

    // throw error if user skill does not exist
    if (!userSkill) {
      throw new HttpException(USER_SKILL_DOES_NOT_EXIST, 400);
    }
    Object.assign(userSkill, skillDto);
    return await this.userSkillRepository.save(userSkill);
  }

  /**
   * delete user skill
   * @param  user_id, skill_id
   * @throws {HttpException} - If user skill does not exist or user is unauthorised
   * @returns {void} - delete column with user_id and skill_id
   */
  async deleteUserSkill(user_skill_id: number, user_id: number): Promise<void> {
    const [userSkill] = await this.userSkillRepository.find({
      where: { id: user_skill_id, user_id: { id: user_id } },
    });

    // throw error if user skill does not exist
    if (!userSkill) {
      throw new HttpException(USER_SKILL_DOES_NOT_EXIST, 400);
    }

    await this.userSkillRepository.delete(user_skill_id);
    return;
  }

  /**
   * get user skills
   * @param  user_id
   * @returns {UserSkills[]} - update column with user_id and skill_id
   */
  async getUserSkills(user_id: number): Promise<UserSkills[]> {
    const userSkills = await this.userSkillRepository.find({
      where: { user_id: { id: user_id } },
      relations: ['skill_id'],
      order: { created_at: 'DESC' },
    });

    return userSkills;
  }

  /**
   * get all user skills based on hash_id
   * @param  hash_id
   * @returns {UserSkills[]} - update column with user_id and skill_id
   */
  async getAllUserSkills(hash_id: string): Promise<UserSkills[]> {
    const userSkills = await this.userSkillRepository.find({
      where: { user_id: { hash_id: hash_id } },
      relations: ['skill_id'],
      order: { created_at: 'DESC' },
    });

    return userSkills;
  }

  /**
   * Updates user skill ratings by processing the ratings from the repository.
   *
   * This method performs the following steps:
   * 1. Retrieves all user skill ratings from the `ratedSkillViewRepository`.
   * 2. Creates a unique set of user skill ratings where the `is_ai_generated` flag is set to `false`
   *    if any entry for the same candidate and skill combination has it as `false`.
   * 3. Updates the `userSkillRepository` with the evaluated rating value for each unique user skill.
   *
   * @returns {Promise<UserRatedSkillView[]>} A promise that resolves to an array of `UserRatedSkillView` objects.
   */
  async updateUserSkillRatings(): Promise<UserRatedSkillView[]> {
    const userSkillsRatings = await this.ratedSkillViewRepository.find();

    // create unique set which adds is_ai_generated to be false if any entry has it as true
    const uniqueUserSkillsRatings: UserRatedSkillView[] = Object.values(
      userSkillsRatings.reduce((acc, item) => {
        const key = `${item.candidate_id}-${item.skill_id}`;

        if (acc[key]) {
          // If the combination already exists, set is_ai_generated to false if any entry has it as false
          acc[key].is_ai_generated =
            acc[key].is_ai_generated && item.is_ai_generated;
        } else {
          // If the combination does not exist, add it to the accumulator
          acc[key] = { ...item };
        }

        return acc;
      }, {}),
    );

    for (const userSkill of uniqueUserSkillsRatings) {
      await this.userSkillRepository.update(
        {
          user_id: { id: userSkill.candidate_id },
          skill_id: { id: userSkill.skill_id },
        },
        { evaluated_rating_value: userSkill.weighted_average_rating },
      );
    }

    return userSkillsRatings;
  }

  /**
   * Refreshes the candidate skills materialized view.
   *
   * @param cron_job_name - The name of the cron job to be executed.
   * @returns A promise that resolves to a boolean indicating whether the refresh was successful.
   * @throws An error if the wrong cron job is called.
   */
  async refreshCandidateSkillsMaterializedView(
    cron_job_name: string,
  ): Promise<boolean> {
    if (cron_job_name !== CronJobConstants.refreshCandidateSkillRatings) {
      throw new Error(WRONG_CRON_JOB_CALLED(cron_job_name));
    }
    await this.datasource.query(refreshSkillRatingMaterializedViewQuery);
    return true;
  }

  /**
   * Rates a candidate's skill by either creating a new rating or updating an existing one.
   *
   * @param {CandidateSkillRatingDto} ratingDto - The data transfer object containing the rating details.
   * @param {number} user_id - user id of the pers
   * @returns {Promise<CandidateSkillRating>} - A promise that resolves to the updated or newly created rating.
   */
  async rateCandidateSkill(
    ratingDto: CandidateSkillRatingDto,
    user_id: number,
  ): Promise<CandidateSkillRating> {
    const { skill_id, rating_value, candidate_id, additional_comments } =
      ratingDto;

    // check if candidate skill id is already rated
    let ratedSkill = await this.candidateSkillRatingRepository.findOne({
      where: {
        candidate_id: { id: +candidate_id },
        skill_id: { id: +skill_id },
        rated_by_id: { id: +user_id },
      },
    });

    // if skill is not rated, create new rating
    if (!ratedSkill) {
      ratedSkill = this.candidateSkillRatingRepository.create({
        ...ratingDto,
        rated_by_id: { id: user_id },
      });
    }
    // if skill is rated, update the rating
    else {
      ratedSkill.rating_value = rating_value;
      ratedSkill.additional_comments = additional_comments;
    }

    return await this.candidateSkillRatingRepository.save(ratedSkill);
  }

  /**
   * Get all candidate skill ratings rated by the current user.
   *
   * @param {number} user_id - The ID of the current user.
   * @returns {Promise<CandidateSkillRating[]>} - A promise that resolves to an array of `CandidateSkillRating` objects.
   */
  async getCandidateSkillRatingsByUser(
    candidate_id: number,
    user_id: number,
  ): Promise<CandidateSkillRating[]> {
    return await this.candidateSkillRatingRepository.find({
      where: {
        rated_by_id: { id: user_id },
        candidate_id: { id: candidate_id },
      },
      relations: ['skill_id'],
      order: { created_at: 'DESC' },
    });
  }
}
